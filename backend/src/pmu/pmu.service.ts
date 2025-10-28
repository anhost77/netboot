import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface PMURace {
  numOfficiel: number;
  nom: string;
  heureDepart: string;
  discipline: string;
  montantPrix: number;
  distanceUnite?: string;
  distance?: number;
}

interface PMUMeeting {
  numOfficiel: number;
  hippodrome: {
    code: string;
    libelleCourt: string;
    libelleLong: string;
  };
  courses: PMURace[];
}

interface PMUParticipant {
  numPmu: number;
  nom: string;
  ordreArrivee?: number;
  deferre?: boolean;
  oeilleres?: boolean;
  indicateurInedit?: boolean;
  musique?: string;
  rapportProbable?: number; // Cote probable
  rapportDirect?: number; // Cote directe
}

interface PMUProgramme {
  programme: {
    reunions: PMUMeeting[];
  };
}

@Injectable()
export class PmuService {
  private readonly logger = new Logger(PmuService.name);
  private readonly baseUrl = 'https://online.turfinfo.api.pmu.fr/rest/client';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get today's race program
   */
  async getTodayProgram(): Promise<any> {
    try {
      const today = this.formatDate(new Date());
      const url = `${this.baseUrl}/1/programme/${today}`;
      
      this.logger.debug(`Fetching PMU program for ${today}`);
      const response = await firstValueFrom(
        this.httpService.get<PMUProgramme>(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return this.formatProgramData(response.data);
    } catch (error) {
      this.logger.error('Error fetching PMU program:', error.message);
      throw new HttpException('Impossible de récupérer le programme PMU', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get program for a specific date
   */
  async getProgramByDate(date: Date): Promise<any> {
    try {
      const formattedDate = this.formatDate(date);
      const url = `${this.baseUrl}/1/programme/${formattedDate}`;
      
      this.logger.debug(`Fetching PMU program for ${formattedDate}`);
      const response = await firstValueFrom(
        this.httpService.get<PMUProgramme>(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return this.formatProgramData(response.data);
    } catch (error) {
      this.logger.error(`Error fetching PMU program for ${date}:`, error.message);
      throw new HttpException('Impossible de récupérer le programme PMU', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get race participants
   */
  async getRaceParticipants(date: Date, reunion: number, course: number): Promise<any> {
    try {
      const formattedDate = this.formatDate(date);
      const url = `${this.baseUrl}/61/programme/${formattedDate}/R${reunion}/C${course}/participants`;
      
      this.logger.debug(`Fetching participants for ${formattedDate} R${reunion}C${course}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      this.logger.debug(`Raw API response keys: ${Object.keys(response.data || {}).join(', ')}`);
      this.logger.debug(`Sample data: ${JSON.stringify(response.data).substring(0, 200)}`);

      return this.formatParticipantsData(response.data);
    } catch (error) {
      this.logger.error(`Error fetching race participants:`, error.message);
      throw new HttpException('Impossible de récupérer les partants', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get race details
   */
  async getRaceDetails(date: Date, reunion: number, course: number): Promise<any> {
    try {
      const formattedDate = this.formatDate(date);
      const url = `${this.baseUrl}/1/programme/${formattedDate}/R${reunion}/C${course}`;
      
      this.logger.debug(`Fetching race details for ${formattedDate} R${reunion}C${course}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching race details:`, error.message);
      throw new HttpException('Impossible de récupérer les détails de la course', HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Get race reports (odds/payouts)
   */
  async getRaceReports(date: Date, reunion: number, course: number): Promise<any> {
    try {
      const formattedDate = this.formatDate(date);
      const url = `${this.baseUrl}/2/programme/${formattedDate}/R${reunion}/C${course}/rapports-definitifs`;
      
      this.logger.debug(`Fetching race reports for ${formattedDate} R${reunion}C${course}`);
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 10000,
        })
      );

      return response.data;
    } catch (error) {
      this.logger.warn(`Could not fetch race reports for R${reunion}C${course}: ${error.message}`);
      return null; // Return null if reports not available yet
    }
  }

  /**
   * Get detailed performances for a race (historical data for each horse)
   */
  async getRacePerformances(date: Date, reunion: number, course: number): Promise<any> {
    const formattedDate = this.formatDate(date);
    const url = `${this.baseUrl}/61/programme/${formattedDate}/R${reunion}/C${course}/performances-detaillees/pretty`;
    
    try {
      this.logger.debug(`Fetching detailed performances for ${formattedDate} R${reunion}C${course}`);
      this.logger.debug(`URL: ${url}`);
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'Accept': 'application/json',
          },
          timeout: 15000, // Longer timeout as this endpoint returns more data
        })
      );

      this.logger.log(`✅ Successfully fetched performances for R${reunion}C${course} - ${response.data?.participants?.length || 0} participants`);
      
      // Log a sample of the data structure
      if (response.data?.participants?.[0]) {
        this.logger.debug(`Sample participant data: ${JSON.stringify(response.data.participants[0], null, 2).substring(0, 500)}`);
      }

      return response.data;
    } catch (error) {
      // Log more details about the error
      if (error.response) {
        this.logger.error(`❌ HTTP ${error.response.status} for R${reunion}C${course}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data).substring(0, 500)}`);
        this.logger.error(`URL was: ${url}`);
      } else {
        this.logger.warn(`Could not fetch detailed performances for R${reunion}C${course}: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Format date to PMU API format (ddMMyyyy)
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  }

  /**
   * Format program data for easier consumption
   */
  private formatProgramData(data: PMUProgramme): any {
    if (!data?.programme?.reunions) {
      return { meetings: [] };
    }

    const meetings = data.programme.reunions.map((reunion) => ({
      number: reunion.numOfficiel,
      hippodrome: {
        code: reunion.hippodrome.code,
        name: reunion.hippodrome.libelleCourt,
        fullName: reunion.hippodrome.libelleLong,
      },
      races: reunion.courses.map((course, index) => ({
        number: course.numOfficiel || (index + 1),
        name: course.nom || `Course ${index + 1}`,
        startTime: course.heureDepart,
        discipline: course.discipline,
        prize: course.montantPrix,
        distance: course.distance,
        distanceUnit: course.distanceUnite,
      })),
    }));

    return { meetings };
  }

  /**
   * Format participants data
   */
  private formatParticipantsData(data: any): any {
    if (!data?.participants) {
      return [];
    }

    const participants = data.participants.map((participant: any) => ({
      number: participant.numPmu,
      nom: participant.nom, // Garder 'nom' pour compatibilité
      name: participant.nom,
      jockey: participant.driver || participant.jockey || null, // driver pour le trot, jockey pour le plat
      trainer: participant.entraineur || participant.nomEntraineur || null, // Entraîneur
      ordreArrivee: participant.ordreArrivee,
      arrivalOrder: participant.ordreArrivee,
      unshod: participant.deferre,
      blinkers: participant.oeilleres,
      firstTime: participant.indicateurInedit,
      recentForm: participant.musique,
      odds: participant.rapportProbable || participant.rapportDirect || null,
    }));

    return participants;
  }
}
