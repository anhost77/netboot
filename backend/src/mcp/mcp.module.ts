import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { SupportModule } from '../support/support.module';

@Module({
  imports: [UserSettingsModule, SupportModule],
  controllers: [McpController],
})
export class McpModule {}
