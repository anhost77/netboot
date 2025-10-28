import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { PmuService } from './pmu.service';
import { PmuDataService } from './pmu-data.service';
import { EmailService } from '../email/email.service';
import { PushNotificationService } from '../notifications/push-notification.service';

@Injectable()
export class PmuAutoUpdateService {
  private readonly logger = new Logger(PmuAutoUpdateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pmuService: PmuService,
    private readonly pmuDataService: PmuDataService,
    private readonly emailService: EmailService,
    private readonly pushNotificationService: PushNotificationService,
  ) {
    this.logger.log('✅ PmuAutoUpdateService initialized - Cron job will start automatically');
  }

  /**
   * Cron job qui s'exécute toutes les 10 minutes
   * Vérifie les paris en attente et met à jour leur statut
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'check-pending-bets',
  })
  async checkPendingBets() {
    this.logger.log('🔄 Starting automatic bet status update...');

    try {
      // 1. Récupérer tous les paris en attente liés à une course PMU ET sur plateforme PMU
      const pendingBets = await this.prisma.bet.findMany({
        where: {
          status: 'pending',
          pmuRaceId: { not: null },
          OR: [
            { platformId: null }, // Anciens paris sans plateforme (considérés comme PMU)
            {
              bettingPlatform: {
                platformType: 'PMU',
                autoUpdateResults: true,
              },
            },
          ],
        },
        include: {
          user: true,
          bettingPlatform: true,
          pmuRace: {
            include: {
              horses: true,
            },
          },
        },
      });

      this.logger.log(`Found ${pendingBets.length} pending PMU bets to check (auto-update only)`);

      for (const bet of pendingBets) {
        try {
          await this.updateBetStatus(bet);
        } catch (error) {
          this.logger.error(`Error updating bet ${bet.id}: ${error.message}`, error.stack);
          // Continue avec les autres paris même si celui-ci échoue
        }
      }

      this.logger.log('✅ Automatic bet status update completed');
      
      // 2. Notifier les utilisateurs pour les paris manuels (non-PMU)
      await this.notifyManualBetsUpdate();
    } catch (error) {
      this.logger.error(`Error in checkPendingBets: ${error.message}`, error.stack);
    }
  }

  /**
   * Notifie les utilisateurs qu'ils doivent mettre à jour manuellement leurs paris
   */
  private async notifyManualBetsUpdate() {
    try {
      // Récupérer les paris en attente sur plateformes non-PMU qui nécessitent une mise à jour manuelle
      const manualBets = await this.prisma.bet.findMany({
        where: {
          status: 'pending',
          requiresManualUpdate: true,
          bettingPlatform: {
            platformType: { not: 'PMU' },
          },
          // Course passée depuis au moins 1 heure
          date: {
            lte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
        include: {
          user: true,
          bettingPlatform: true,
        },
      });

      this.logger.log(`Found ${manualBets.length} manual bets requiring user update`);

      for (const bet of manualBets) {
        try {
          await this.sendManualUpdateNotification(bet);
          
          // Marquer comme notifié pour ne pas spammer
          await this.prisma.bet.update({
            where: { id: bet.id },
            data: { requiresManualUpdate: false },
          });
        } catch (error) {
          this.logger.error(`Error notifying manual bet ${bet.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error in notifyManualBetsUpdate: ${error.message}`, error.stack);
    }
  }

  /**
   * Envoie une notification pour demander à l'utilisateur de mettre à jour son pari
   */
  private async sendManualUpdateNotification(bet: any) {
    const platformName = bet.bettingPlatform?.name || 'votre plateforme';
    const subject = '⏰ Mise à jour de pari requise';
    const message = `Votre pari sur ${platformName} (${bet.hippodrome || 'la course'}) nécessite une mise à jour manuelle. Veuillez indiquer le résultat et la cote finale.`;

    // Envoyer un email
    if (bet.user?.email) {
      try {
        await this.emailService.sendEmail({
          to: bet.user.email,
          subject: subject,
          html: `
            <h2>${subject}</h2>
            <p>${message}</p>
            <p><strong>Détails du pari:</strong></p>
            <ul>
              <li>Plateforme: ${platformName}</li>
              <li>Hippodrome: ${bet.hippodrome || 'N/A'}</li>
              <li>Course: ${bet.raceNumber || 'N/A'}</li>
              <li>Chevaux: ${bet.horsesSelected || 'N/A'}</li>
              <li>Mise: ${bet.stake}€</li>
              <li>Cote saisie: ${bet.odds || 'N/A'}</li>
            </ul>
            <p><a href="${process.env.FRONTEND_URL}/dashboard/bets" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Mettre à jour le pari</a></p>
          `,
        });
        this.logger.log(`📧 Manual update email sent to ${bet.user.email} for bet ${bet.id}`);
      } catch (error) {
        this.logger.error(`Error sending email for manual bet ${bet.id}: ${error.message}`);
      }
    }

    // Envoyer une notification push
    try {
      await this.pushNotificationService.sendToUser(
        bet.userId,
        subject,
        message,
        {
          type: 'manual_bet_update',
          betId: bet.id,
          action: 'update_bet',
        },
      );
      this.logger.log(`📱 Manual update push sent to user ${bet.userId} for bet ${bet.id}`);
    } catch (error) {
      this.logger.error(`Error sending push for manual bet ${bet.id}: ${error.message}`);
    }
  }

  /**
   * Met à jour le statut d'un pari en fonction des résultats de la course
   */
  private async updateBetStatus(bet: any) {
    if (!bet.pmuRace) {
      this.logger.warn(`Bet ${bet.id} has no PMU race linked`);
      return;
    }

    const race = bet.pmuRace;
    const raceDate = new Date(race.date);
    const now = new Date();

    // Vérifier si la course est passée (au moins 15 minutes après la date de la course)
    const minutesSinceRace = (now.getTime() - raceDate.getTime()) / (1000 * 60);
    if (minutesSinceRace < 15) {
      this.logger.debug(`Race ${race.id} is too recent (${minutesSinceRace.toFixed(0)} minutes), skipping`);
      return;
    }

    // Récupérer les résultats depuis l'API PMU
    try {
      await this.pmuDataService.updateHorseOddsFromReports(
        race.id,
        raceDate,
        race.reunionNumber,
        race.raceNumber,
      );
    } catch (error) {
      this.logger.warn(`Could not fetch reports for race ${race.id}: ${error.message}`);
    }

    // Recharger les chevaux avec les résultats mis à jour
    const updatedRace = await this.prisma.pmuRace.findUnique({
      where: { id: race.id },
      include: { horses: true },
    });

    if (!updatedRace || !updatedRace.horses.some(h => h.arrivalOrder)) {
      this.logger.debug(`No results available yet for race ${race.id}`);
      return;
    }

    // Déterminer si le pari est gagné ou perdu
    const isWon = this.checkIfBetWon(bet, updatedRace.horses);
    const newStatus = isWon ? 'won' : 'lost';

    // Récupérer la cote appropriée depuis les rapports PMU
    let odds = bet.odds;
    let payout = bet.payout;
    
    if (isWon) {
      const pmuOdds = await this.pmuDataService.getOddsForBet(
        race.id,
        bet.betType || 'gagnant',
        bet.horsesSelected || '',
      );

      if (pmuOdds) {
        odds = pmuOdds;
        payout = bet.stake * pmuOdds;
        this.logger.log(`✅ Retrieved odds from PMU for bet ${bet.id}: ${pmuOdds}€ → payout: ${payout}€`);
      } else {
        this.logger.warn(`Could not retrieve odds from PMU for bet ${bet.id}, using existing odds`);
      }
    }

    // Calculer le profit/perte selon la même logique que updateStatus
    let profit: number | null = null;
    if (newStatus === 'won' && payout) {
      profit = payout - bet.stake;
    } else if (newStatus === 'lost') {
      profit = -bet.stake;
    }

    // Mettre à jour le pari avec odds, payout et profit
    await this.prisma.bet.update({
      where: { id: bet.id },
      data: {
        status: newStatus,
        odds: odds || null,
        payout: payout || null,
        profit: profit !== null ? profit : null,
      },
    });

    this.logger.log(`✅ Updated bet ${bet.id}: ${newStatus} (profit: ${profit}€)`);

    // Envoyer une notification à l'utilisateur
    await this.sendBetResultNotification(bet, newStatus, profit || 0);
  }

  /**
   * Vérifie si un pari est gagné en fonction des résultats
   */
  private checkIfBetWon(bet: any, horses: any[]): boolean {
    if (!bet.horsesSelected) return false;

    // Extraire les numéros des chevaux sélectionnés
    const selectedNumbers = bet.horsesSelected
      .split(',')
      .map((h: string) => {
        const match = h.trim().match(/^(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((n: number) => n > 0);

    if (selectedNumbers.length === 0) return false;

    // Vérifier selon le type de pari
    switch (bet.betType) {
      case 'gagnant':
      case 'SIMPLE_GAGNANT':
        // Le cheval doit être 1er
        const winner = horses.find(h => h.arrivalOrder === 1);
        return winner && selectedNumbers.includes(winner.number);

      case 'place':
      case 'SIMPLE_PLACE':
        // Le cheval doit être dans les 3 premiers
        const placedHorses = horses.filter(h => h.arrivalOrder && h.arrivalOrder <= 3);
        return selectedNumbers.some((num: number) => placedHorses.some(h => h.number === num));

      case 'gagnant_place':
      case 'GAGNANT_PLACE':
        // Gagné si 1er, placé si dans les 3 premiers
        const firstPlace = horses.find(h => h.arrivalOrder === 1);
        if (firstPlace && selectedNumbers.includes(firstPlace.number)) return true;
        const topThree = horses.filter(h => h.arrivalOrder && h.arrivalOrder <= 3);
        return selectedNumbers.some((num: number) => topThree.some(h => h.number === num));

      case 'couple':
      case 'COUPLE_GAGNANT':
        // Les 2 chevaux doivent être 1er et 2ème (dans l'ordre ou le désordre)
        if (selectedNumbers.length < 2) return false;
        const first = horses.find(h => h.arrivalOrder === 1);
        const second = horses.find(h => h.arrivalOrder === 2);
        return (
          first &&
          second &&
          selectedNumbers.includes(first.number) &&
          selectedNumbers.includes(second.number)
        );

      case 'trio':
      case 'TRIO':
        // Les 3 chevaux doivent être dans les 3 premiers
        if (selectedNumbers.length < 3) return false;
        const topThreeHorses = horses.filter(h => h.arrivalOrder && h.arrivalOrder <= 3);
        return (
          topThreeHorses.length >= 3 &&
          selectedNumbers.every((num: number) => topThreeHorses.some(h => h.number === num))
        );

      default:
        this.logger.warn(`Unknown bet type: ${bet.betType}`);
        return false;
    }
  }

  /**
   * Envoie une notification à l'utilisateur sur le résultat de son pari
   */
  private async sendBetResultNotification(bet: any, status: string, profit: number) {
    const isWon = status === 'won';
    const subject = isWon ? '🎉 Pari gagné !' : '😔 Pari perdu';
    const message = isWon
      ? `Félicitations ! Votre pari sur ${bet.hippodrome || 'la course'} est gagné ! Profit: ${profit.toFixed(2)}€`
      : `Votre pari sur ${bet.hippodrome || 'la course'} n'a malheureusement pas été gagnant. Perte: ${Math.abs(profit).toFixed(2)}€`;

    let emailSent = false;
    let pushSent = false;

    // Envoyer un email
    if (bet.user?.email) {
      try {
        await this.emailService.sendEmail({
          to: bet.user.email,
          subject: subject,
          html: `
            <h2>${subject}</h2>
            <p>${message}</p>
            <p><strong>Détails du pari:</strong></p>
            <ul>
              <li>Hippodrome: ${bet.hippodrome || 'N/A'}</li>
              <li>Course: ${bet.raceNumber || 'N/A'}</li>
              <li>Chevaux: ${bet.horsesSelected || 'N/A'}</li>
              <li>Mise: ${bet.stake}€</li>
              <li>Cote: ${bet.odds || 'N/A'}</li>
              <li>Résultat: ${isWon ? 'Gagné ✅' : 'Perdu ❌'}</li>
              <li>Profit/Perte: ${profit.toFixed(2)}€</li>
            </ul>
          `,
        });
        emailSent = true;
        this.logger.log(`📧 Email sent to ${bet.user.email} for bet ${bet.id}`);
      } catch (error) {
        this.logger.error(`Error sending email for bet ${bet.id}: ${error.message}`);
      }
    }

    // Envoyer une notification push (indépendamment de l'email)
    try {
      await this.pushNotificationService.sendToUser(
        bet.userId,
        subject,
        message,
        {
          type: 'bet_result',
          betId: bet.id,
          status: status,
        },
      );
      pushSent = true;
      this.logger.log(`📱 Push notification sent to user ${bet.userId} for bet ${bet.id}`);
    } catch (error) {
      this.logger.error(`Error sending push notification for bet ${bet.id}: ${error.message}`);
    }

    if (emailSent || pushSent) {
      this.logger.log(`✅ Notification(s) sent for bet ${bet.id} (email: ${emailSent}, push: ${pushSent})`);
    } else {
      this.logger.warn(`⚠️ No notification sent for bet ${bet.id}`);
    }
  }

}
