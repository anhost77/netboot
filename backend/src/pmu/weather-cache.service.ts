import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface CachedWeather {
  hippodromeName: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  description: string;
  cachedAt: Date;
}

@Injectable()
export class WeatherCacheService {
  private readonly logger = new Logger(WeatherCacheService.name);
  private readonly CACHE_DURATION_HOURS = 3; // Cache météo pendant 3h
  private readonly memoryCache: Map<string, CachedWeather> = new Map();
  
  // Compteur d'appels API pour respecter la limite
  private apiCallsToday = 0;
  private lastResetDate: Date = new Date();
  private readonly MAX_CALLS_PER_DAY = 950; // Marge de sécurité (1000 - 50)

  constructor(private readonly prisma: PrismaService) {
    this.resetDailyCounterIfNeeded();
  }

  /**
   * Vérifie si on peut faire un appel API
   */
  canMakeApiCall(): boolean {
    this.resetDailyCounterIfNeeded();
    
    if (this.apiCallsToday >= this.MAX_CALLS_PER_DAY) {
      this.logger.warn(`⚠️ API call limit reached: ${this.apiCallsToday}/${this.MAX_CALLS_PER_DAY}`);
      return false;
    }
    
    return true;
  }

  /**
   * Incrémente le compteur d'appels API
   */
  incrementApiCallCounter(): void {
    this.apiCallsToday++;
    this.logger.debug(`API calls today: ${this.apiCallsToday}/${this.MAX_CALLS_PER_DAY}`);
  }

  /**
   * Récupère le nombre d'appels restants
   */
  getRemainingCalls(): number {
    this.resetDailyCounterIfNeeded();
    return Math.max(0, this.MAX_CALLS_PER_DAY - this.apiCallsToday);
  }

  /**
   * Réinitialise le compteur si on change de jour
   */
  private resetDailyCounterIfNeeded(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastReset = new Date(this.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);
    
    if (today.getTime() !== lastReset.getTime()) {
      this.logger.log(`🔄 Resetting API call counter (was: ${this.apiCallsToday})`);
      this.apiCallsToday = 0;
      this.lastResetDate = new Date();
    }
  }

  /**
   * Récupère la météo depuis le cache (mémoire ou BDD)
   */
  async getCachedWeather(hippodromeName: string): Promise<CachedWeather | null> {
    // 1. Vérifier le cache mémoire d'abord (ultra rapide)
    const memCached = this.getFromMemoryCache(hippodromeName);
    if (memCached) {
      this.logger.debug(`✅ Weather from memory cache for ${hippodromeName}`);
      return memCached;
    }

    // 2. Vérifier le cache BDD (rapide)
    const dbCached = await this.getFromDatabaseCache(hippodromeName);
    if (dbCached) {
      this.logger.debug(`✅ Weather from DB cache for ${hippodromeName}`);
      // Stocker en mémoire pour la prochaine fois
      this.storeInMemoryCache(hippodromeName, dbCached);
      return dbCached;
    }

    return null;
  }

  /**
   * Stocke la météo dans les caches
   */
  async cacheWeather(hippodromeName: string, weather: Omit<CachedWeather, 'hippodromeName' | 'cachedAt'>): Promise<void> {
    const cached: CachedWeather = {
      hippodromeName,
      ...weather,
      cachedAt: new Date(),
    };

    // 1. Stocker en mémoire
    this.storeInMemoryCache(hippodromeName, cached);

    // 2. Stocker en BDD pour persistance
    await this.storInDatabaseCache(cached);
  }

  /**
   * Cache mémoire (ultra rapide, mais perdu au redémarrage)
   */
  private getFromMemoryCache(hippodromeName: string): CachedWeather | null {
    const cached = this.memoryCache.get(hippodromeName);
    
    if (!cached) {
      return null;
    }

    // Vérifier si le cache est encore valide
    const age = Date.now() - cached.cachedAt.getTime();
    const maxAge = this.CACHE_DURATION_HOURS * 60 * 60 * 1000;
    
    if (age > maxAge) {
      this.memoryCache.delete(hippodromeName);
      return null;
    }

    return cached;
  }

  private storeInMemoryCache(hippodromeName: string, weather: CachedWeather): void {
    this.memoryCache.set(hippodromeName, weather);
  }

  /**
   * Cache BDD (persistant, mais plus lent)
   */
  private async getFromDatabaseCache(hippodromeName: string): Promise<CachedWeather | null> {
    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - this.CACHE_DURATION_HOURS);

      // Chercher la météo la plus récente pour cet hippodrome
      const race = await this.prisma.pmuRace.findFirst({
        where: {
          hippodrome: {
            name: hippodromeName,
          },
          weather: { not: null },
          updatedAt: { gte: cutoff },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          weather: true,
          updatedAt: true,
        },
      });

      if (!race || !race.weather) {
        return null;
      }

      // Convertir en CachedWeather (format simplifié)
      return {
        hippodromeName,
        temperature: 15, // Valeur par défaut
        humidity: 60,
        windSpeed: 5,
        precipitation: race.weather.includes('PLUIE') ? 5 : 0,
        condition: race.weather.toLowerCase(),
        description: race.weather,
        cachedAt: race.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error getting weather from DB cache:', error.message);
      return null;
    }
  }

  private async storInDatabaseCache(weather: CachedWeather): Promise<void> {
    try {
      // Mettre à jour toutes les courses récentes de cet hippodrome
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await this.prisma.pmuRace.updateMany({
        where: {
          hippodrome: {
            name: weather.hippodromeName,
          },
          date: {
            gte: today,
            lt: tomorrow,
          },
          weather: null, // Seulement celles sans météo
        },
        data: {
          weather: this.mapConditionToString(weather.condition),
        },
      });
    } catch (error) {
      this.logger.error('Error storing weather in DB cache:', error.message);
    }
  }

  private mapConditionToString(condition: string): string {
    const mapping: Record<string, string> = {
      'clear': 'ENSOLEILLE',
      'clouds': 'NUAGEUX',
      'rain': 'PLUIE',
      'drizzle': 'BRUINE',
      'thunderstorm': 'ORAGE',
      'snow': 'NEIGE',
      'mist': 'BROUILLARD',
      'fog': 'BROUILLARD',
    };

    return mapping[condition.toLowerCase()] || 'VARIABLE';
  }

  /**
   * Nettoie le cache mémoire (appelé périodiquement)
   */
  cleanMemoryCache(): void {
    const maxAge = this.CACHE_DURATION_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.memoryCache.entries()) {
      const age = now - cached.cachedAt.getTime();
      if (age > maxAge) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`🧹 Cleaned ${cleaned} expired entries from memory cache`);
    }
  }

  /**
   * Statistiques du cache
   */
  getStats(): {
    memoryCacheSize: number;
    apiCallsToday: number;
    remainingCalls: number;
    cacheHitRate: number;
  } {
    return {
      memoryCacheSize: this.memoryCache.size,
      apiCallsToday: this.apiCallsToday,
      remainingCalls: this.getRemainingCalls(),
      cacheHitRate: 0, // À implémenter si besoin
    };
  }

  /**
   * Stratégie intelligente : quels hippodromes méritent un appel API ?
   */
  async prioritizeHippodromes(): Promise<string[]> {
    try {
      // Récupérer les courses du jour sans météo
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const races = await this.prisma.pmuRace.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
          weather: null,
        },
        include: {
          hippodrome: true,
        },
        orderBy: {
          startTime: 'asc', // Prioriser les courses qui commencent bientôt
        },
      });

      // Grouper par hippodrome et compter
      const hippodromeCounts = new Map<string, number>();
      for (const race of races) {
        const name = race.hippodrome.name;
        hippodromeCounts.set(name, (hippodromeCounts.get(name) || 0) + 1);
      }

      // Trier par nombre de courses (prioriser les hippodromes avec le plus de courses)
      const sorted = Array.from(hippodromeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name]) => name);

      this.logger.log(`📊 Priority hippodromes: ${sorted.slice(0, 5).join(', ')}`);
      
      return sorted;
    } catch (error) {
      this.logger.error('Error prioritizing hippodromes:', error.message);
      return [];
    }
  }
}
