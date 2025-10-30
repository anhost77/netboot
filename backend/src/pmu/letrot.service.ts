import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * Service pour récupérer des données complémentaires depuis l'API Le Trot
 * API Documentation: https://api.letrot.fr/
 */
@Injectable()
export class LeTrotService {
  private readonly logger = new Logger(LeTrotService.name);
  private readonly baseUrl = 'https://api.letrot.fr/statistics/v1';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Rechercher un cheval par nom
   */
  async searchHorse(horseName: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/horses`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            name: horseName,
          },
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return response.data;
    } catch (error) {
      this.logger.warn(`Failed to search horse ${horseName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Récupérer les détails complets d'un cheval
   */
  async getHorseDetails(horseId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/horses/${horseId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      const horse = response.data;
      
      return {
        name: horse.name,
        sex: horse.sex,
        birthDate: horse.birthDate,
        breed: horse.breed,
        breeder: horse.breeder?.name || null,
        owner: horse.owner?.name || null,
        trainer: horse.trainer?.name || null,
        sire: horse.sire?.name || null, // Père
        dam: horse.dam?.name || null, // Mère
        earnings: horse.earnings,
        starts: horse.starts,
        wins: horse.wins,
        places: horse.places,
      };
    } catch (error) {
      this.logger.warn(`Failed to get horse details ${horseId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Récupérer les performances d'un cheval
   */
  async getHorsePerformances(horseId: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/horses/${horseId}/performances`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return response.data || [];
    } catch (error) {
      this.logger.warn(`Failed to get horse performances ${horseId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Enrichir les données d'un cheval avec les infos Le Trot
   */
  async enrichHorseData(horseName: string): Promise<any> {
    try {
      // 1. Rechercher le cheval
      const searchResults = await this.searchHorse(horseName);
      
      if (!searchResults || searchResults.length === 0) {
        this.logger.debug(`Horse ${horseName} not found in Le Trot database`);
        return null;
      }

      // 2. Prendre le premier résultat (le plus pertinent)
      const horseId = searchResults[0].id;

      // 3. Récupérer les détails complets
      const details = await this.getHorseDetails(horseId);

      this.logger.log(`✅ Enriched data for ${horseName} from Le Trot`);
      return details;
    } catch (error) {
      this.logger.error(`Failed to enrich horse data for ${horseName}: ${error.message}`);
      return null;
    }
  }
}
