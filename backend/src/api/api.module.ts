import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { SupportModule } from '../support/support.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';

@Module({
  imports: [SupportModule, UserSettingsModule],
  controllers: [ApiController],
})
export class ApiModule {}
