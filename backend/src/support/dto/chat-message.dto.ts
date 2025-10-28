import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ConversationMessage {
  @ApiProperty({ enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty()
  @IsString()
  content: string;
}

export class ChatMessageDto {
  @ApiProperty({ description: 'User message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Conversation history', type: [ConversationMessage] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  @IsOptional()
  conversationHistory?: ConversationMessage[];
}
