import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsString, IsOptional, IsDateString } from 'class-validator';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export class CreateTransactionDto {
  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
    description: 'Type de transaction (dépôt ou retrait)',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    example: 50,
    description: 'Montant de la transaction en euros',
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({
    example: 'Dépôt initial PMU',
    description: 'Description de la transaction',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-10-24',
    description: 'Date de la transaction (ISO 8601). Par défaut: date actuelle',
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}
