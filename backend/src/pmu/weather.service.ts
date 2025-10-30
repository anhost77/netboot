import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../prisma.service';
import { WeatherCacheService } from './weather-cache.service';
import { firstValueFrom } from 'rxjs';

interface WeatherData {
  temperature: number;      // °C
  humidity: number;         // %
  windSpeed: number;        // m/s
  precipitation: number;    // mm
  condition: string;        // clear, rain, clouds, etc.
  description: string;      // Description détaillée
}

interface HippodromeCoordinates {
  lat: number;
  lon: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';
  
  // Coordonnées GPS des principaux hippodromes français
  private readonly hippodromeCoordinates: Record<string, HippodromeCoordinates> = {
    'VINCENNES': { lat: 48.8225, lon: 2.4514 },
    'LONGCHAMP': { lat: 48.8567, lon: 2.2285 },
    'AUTEUIL': { lat: 48.8478, lon: 2.2419 },
    'CHANTILLY': { lat: 49.1875, lon: 2.4697 },
    'DEAUVILLE': { lat: 49.3578, lon: 0.0758 },
    'MAISONS-LAFFITTE': { lat: 48.9478, lon: 2.1447 },
    'SAINT-CLOUD': { lat: 48.8414, lon: 2.2089 },
    'COMPIEGNE': { lat: 49.4178, lon: 2.8258 },
    'FONTAINEBLEAU': { lat: 48.4081, lon: 2.7003 },
    'CAGNES-SUR-MER': { lat: 43.6636, lon: 7.1489 },
    'PAU': { lat: 43.3156, lon: -0.3686 },
    'TOULOUSE': { lat: 43.6047, lon: 1.4442 },
    'BORDEAUX-LE-BOUSCAT': { lat: 44.8667, lon: -0.6000 },
    'LYON-PARILLY': { lat: 45.7197, lon: 4.8789 },
    'MARSEILLE-BORELY': { lat: 43.2578, lon: 5.3800 },
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly weatherCache: WeatherCacheService,
  ) {
    this.apiKey = process.env.OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('⚠️ OPENWEATHER_API_KEY not configured. Weather features will be disabled.');
    }
  }

  /**
   * Récupère la météo actuelle pour un hippodrome
   */
  async getCurrentWeather(hippodromeName: string): Promise<WeatherData | null> {
    // 1. Vérifier le cache d'abord
    const cached = await this.weatherCache.getCachedWeather(hippodromeName);
    if (cached) {
      this.logger.debug(`✅ Using cached weather for ${hippodromeName}`);
      return {
        temperature: cached.temperature,
        humidity: cached.humidity,
        windSpeed: cached.windSpeed,
        precipitation: cached.precipitation,
        condition: cached.condition,
        description: cached.description,
      };
    }

    // 2. Vérifier si on peut faire un appel API
    if (!this.weatherCache.canMakeApiCall()) {
      this.logger.warn(`⚠️ API call limit reached. Using fallback for ${hippodromeName}`);
      return null;
    }

    if (!this.apiKey) {
      this.logger.warn('Weather API key not configured');
      return null;
    }

    const coords = this.getHippodromeCoordinates(hippodromeName);
    if (!coords) {
      this.logger.warn(`Coordinates not found for hippodrome: ${hippodromeName}`);
      return null;
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${this.apiKey}&units=metric&lang=fr`;
      
      this.logger.log(`🌐 API call for ${hippodromeName} (${this.weatherCache.getRemainingCalls()} calls remaining)`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const data = response.data;
      
      const weather: WeatherData = {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || 0,
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
      };

      // 3. Incrémenter le compteur et mettre en cache
      this.weatherCache.incrementApiCallCounter();
      await this.weatherCache.cacheWeather(hippodromeName, weather);
      
      return weather;
    } catch (error) {
      this.logger.error(`Error fetching current weather for ${hippodromeName}:`, error.message);
      return null;
    }
  }

  /**
   * Récupère la météo historique pour une date et un hippodrome
   * Utilise l'API Historical Weather (nécessite abonnement payant)
   * Alternative : on peut stocker nos propres données au fil du temps
   */
  async getHistoricalWeather(
    hippodromeName: string,
    date: Date,
  ): Promise<WeatherData | null> {
    // D'abord, vérifier si on a déjà cette donnée en BDD
    const stored = await this.getStoredWeather(hippodromeName, date);
    if (stored) {
      return stored;
    }

    if (!this.apiKey) {
      return null;
    }

    const coords = this.getHippodromeCoordinates(hippodromeName);
    if (!coords) {
      return null;
    }

    try {
      // Convertir la date en timestamp Unix
      const timestamp = Math.floor(date.getTime() / 1000);
      
      // Note: Cette API nécessite un abonnement payant OpenWeatherMap
      // Pour l'instant, on retourne null et on utilisera nos données stockées
      this.logger.debug(`Historical weather API call would be made for ${hippodromeName} at ${date.toISOString()}`);
      
      return null;
    } catch (error) {
      this.logger.error(`Error fetching historical weather:`, error.message);
      return null;
    }
  }

  /**
   * Stocke la météo actuelle pour une course
   */
  async storeWeatherForRace(raceId: string, hippodromeName: string): Promise<void> {
    const weather = await this.getCurrentWeather(hippodromeName);
    
    if (!weather) {
      return;
    }

    try {
      // Mettre à jour la course avec les données météo
      await this.prisma.pmuRace.update({
        where: { id: raceId },
        data: {
          weather: this.mapWeatherCondition(weather.condition),
          // On pourrait aussi stocker plus de détails dans un champ JSON
        },
      });

      this.logger.debug(`Weather stored for race ${raceId}: ${weather.condition}, ${weather.temperature}°C`);
    } catch (error) {
      this.logger.error(`Error storing weather for race ${raceId}:`, error.message);
    }
  }

  /**
   * Récupère la météo stockée en BDD
   */
  private async getStoredWeather(
    hippodromeName: string,
    date: Date,
  ): Promise<WeatherData | null> {
    try {
      // Chercher une course proche dans le temps (même jour)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const race = await this.prisma.pmuRace.findFirst({
        where: {
          hippodrome: {
            name: hippodromeName,
          },
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          weather: { not: null },
        },
        select: {
          weather: true,
          trackCondition: true,
        },
      });

      if (!race || !race.weather) {
        return null;
      }

      // Convertir les données stockées en WeatherData
      // (format simplifié car on ne stocke que la condition)
      return {
        temperature: 15, // Valeur par défaut
        humidity: 60,
        windSpeed: 5,
        precipitation: race.weather.includes('PLUIE') ? 5 : 0,
        condition: race.weather.toLowerCase(),
        description: race.weather,
      };
    } catch (error) {
      this.logger.error('Error getting stored weather:', error.message);
      return null;
    }
  }

  /**
   * Mappe les conditions météo OpenWeather vers nos constantes
   */
  private mapWeatherCondition(condition: string): string {
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
   * Récupère les coordonnées d'un hippodrome
   */
  private getHippodromeCoordinates(hippodromeName: string): HippodromeCoordinates | null {
    // Normaliser le nom (majuscules, sans accents)
    const normalized = hippodromeName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Chercher une correspondance exacte
    if (this.hippodromeCoordinates[normalized]) {
      return this.hippodromeCoordinates[normalized];
    }

    // Chercher une correspondance partielle
    for (const [key, coords] of Object.entries(this.hippodromeCoordinates)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return coords;
      }
    }

    return null;
  }

  /**
   * Analyse l'impact de la météo sur les performances d'un cheval
   */
  async analyzeWeatherImpact(
    horseId: string,
    targetWeather: WeatherData,
  ): Promise<number> {
    try {
      // Récupérer les performances du cheval avec météo
      const performances = await this.prisma.pmuHorsePerformance.findMany({
        where: {
          horseId,
          arrivalPosition: { not: null },
        },
        include: {
          horse: {
            include: {
              race: {
                select: {
                  weather: true,
                  trackCondition: true,
                },
              },
            },
          },
        },
        take: 20,
      });

      if (performances.length === 0) {
        return 50; // Score neutre
      }

      // Filtrer les performances avec météo similaire
      const similarWeatherPerfs = performances.filter(p => {
        const raceWeather = p.horse.race.weather;
        if (!raceWeather) return false;

        // Comparer les conditions
        const targetCondition = this.mapWeatherCondition(targetWeather.condition);
        return raceWeather === targetCondition;
      });

      if (similarWeatherPerfs.length === 0) {
        return 50; // Pas assez de données
      }

      // Calculer la moyenne des positions sous ces conditions
      const avgPosition = similarWeatherPerfs.reduce((sum, p) => 
        sum + (p.arrivalPosition || 10), 0
      ) / similarWeatherPerfs.length;

      // Convertir en score (position 1 = 100, position 10+ = 0)
      const score = Math.max(0, 100 - (avgPosition - 1) * 10);

      this.logger.debug(
        `Weather impact for horse ${horseId}: ${similarWeatherPerfs.length} races in ${targetWeather.condition}, avg position: ${avgPosition.toFixed(1)}, score: ${score.toFixed(0)}`
      );

      return score;
    } catch (error) {
      this.logger.error('Error analyzing weather impact:', error.message);
      return 50;
    }
  }

  /**
   * Détermine l'état de la piste en fonction de la météo
   */
  predictTrackCondition(weather: WeatherData): string {
    if (weather.precipitation > 10) {
      return 'TRES_LOURD';
    } else if (weather.precipitation > 5) {
      return 'LOURD';
    } else if (weather.precipitation > 2 || weather.humidity > 80) {
      return 'SOUPLE';
    } else if (weather.humidity > 60) {
      return 'BON_SOUPLE';
    } else {
      return 'BON';
    }
  }

  /**
   * Collecte et stocke la météo pour toutes les courses du jour
   */
  async collectTodayWeather(): Promise<void> {
    this.logger.log('🌤️ Collecting weather data for today\'s races...');

    try {
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
          weather: null, // Seulement les courses sans météo
        },
        include: {
          hippodrome: true,
        },
      });

      let updated = 0;
      for (const race of races) {
        await this.storeWeatherForRace(race.id, race.hippodrome.name);
        updated++;
        
        // Petit délai pour ne pas surcharger l'API
        await this.delay(1000);
      }

      this.logger.log(`✅ Weather collected for ${updated} races`);
    } catch (error) {
      this.logger.error('Error collecting today weather:', error.message);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
