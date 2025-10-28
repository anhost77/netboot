import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SettingsManagementService } from '../admin/settings-management.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsManagement: SettingsManagementService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public platform settings', description: 'Get public platform settings (no auth required)' })
  async getPublicSettings() {
    const settings = await this.settingsManagement.getSettings();
    
    // Return only public settings
    return {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      siteTagline: settings.siteTagline,
      footerText: settings.footerText,
      supportEmail: settings.supportEmail,
      contactEmail: settings.contactEmail,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      faqUrl: settings.faqUrl,
      socialLinks: settings.socialLinks,
      registrationEnabled: settings.registrationEnabled,
    };
  }
}
