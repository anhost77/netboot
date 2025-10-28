import { PartialType } from '@nestjs/swagger';
import { CreateTipsterDto } from './create-tipster.dto';

export class UpdateTipsterDto extends PartialType(CreateTipsterDto) {}
