import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SupportService } from './support.service';
import { AiChatService } from './ai-chat.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { TicketFiltersDto } from './dto/ticket-filters.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly aiChatService: AiChatService,
  ) {}

  @Post('tickets')
  @ApiOperation({
    summary: 'Create a new support ticket',
    description: 'Create a support ticket with an initial message',
  })
  createTicket(@Request() req: any, @Body() dto: CreateTicketDto) {
    return this.supportService.createTicket(req.user.id, dto);
  }

  @Get('tickets')
  @ApiOperation({
    summary: 'Get all support tickets',
    description:
      'Get paginated list of support tickets. Users see only their tickets, admins see all.',
  })
  findAllTickets(@Request() req: any, @Query() filters: TicketFiltersDto) {
    return this.supportService.findAll(req.user.id, req.user.role, filters);
  }

  @Get('tickets/:id')
  @ApiOperation({
    summary: 'Get a single ticket by ID',
    description: 'Get ticket details with all messages',
  })
  findOneTicket(@Request() req: any, @Param('id') id: string) {
    return this.supportService.findOne(id, req.user.id, req.user.role);
  }

  @Patch('tickets/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Update a ticket (admin only)',
    description: 'Update ticket status, priority, or assignment',
  })
  updateTicket(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.supportService.updateTicket(id, req.user.id, req.user.role, dto);
  }

  @Post('tickets/:id/messages')
  @ApiOperation({
    summary: 'Add a message to a ticket',
    description: 'Add a reply or internal note to a support ticket',
  })
  @HttpCode(HttpStatus.OK)
  addMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.supportService.addMessage(id, req.user.id, req.user.role, dto);
  }

  @Get('tickets/:id/messages')
  @ApiOperation({
    summary: 'Get all messages for a ticket',
    description: 'Get all messages (excluding internal notes for non-admins)',
  })
  getMessages(@Request() req: any, @Param('id') id: string) {
    return this.supportService.getMessages(id, req.user.id, req.user.role);
  }

  @Patch('tickets/:id/close')
  @ApiOperation({
    summary: 'Close a ticket',
    description: 'Mark a ticket as closed',
  })
  @HttpCode(HttpStatus.OK)
  closeTicket(@Request() req: any, @Param('id') id: string) {
    return this.supportService.closeTicket(id, req.user.id, req.user.role);
  }

  @Get('statistics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({
    summary: 'Get support statistics (admin only)',
    description: 'Get ticket counts, status distribution, and metrics',
  })
  getStatistics() {
    return this.supportService.getStatistics();
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with AI support assistant',
    description: 'Send a message to the AI chatbot and get a response',
  })
  async chat(@Request() req: any, @Body() dto: ChatMessageDto) {
    const response = await this.aiChatService.chat(
      dto.message,
      dto.conversationHistory || [],
      req.user.id, // Pass userId for function calling
    );
    return response;
  }
}
