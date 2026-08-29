import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { ReleaseEscrowDto, RefundEscrowDto } from './dto/release-escrow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Fintech, Payments & Escrow Ledger')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initiate payment via Telebirr or CBE Birr and create Escrow Hold',
    description: 'Inserts payment record (Table 16) and initial escrow hold entry (Table 18)',
  })
  @ApiResponse({ status: 201, description: 'Payment and escrow initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async initiatePayment(
    @CurrentUser('sub') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(dto, userId);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public Webhook Receiver for Telebirr / CBE Birr Payment Callbacks',
    description: 'Idempotently logs provider events (Table 17) and marks escrow funds as held',
  })
  @ApiParam({ name: 'provider', example: 'telebirr' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() dto: PaymentWebhookDto,
  ) {
    // Ensure provider from route matches dto if not provided
    if (!dto.provider) {
      dto.provider = provider;
    }
    return this.paymentsService.handleWebhook(dto);
  }

  @Post('escrow/:orderId/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Release Escrow Funds to Seller',
    description: 'Invoked when buyer confirms successful delivery/inspection of goods',
  })
  @ApiParam({ name: 'orderId', description: 'Target order UUID' })
  @ApiResponse({ status: 200, description: 'Escrow released to seller' })
  @ApiResponse({ status: 400, description: 'Payment not completed or already released' })
  async releaseEscrow(
    @CurrentUser('sub') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: ReleaseEscrowDto,
  ) {
    return this.paymentsService.releaseEscrow(orderId, userId, dto.notes);
  }

  @Post('escrow/:orderId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refund Escrow Funds to Buyer',
    description: 'Refunds held funds back to buyer upon order cancellation or dispute resolution',
  })
  @ApiParam({ name: 'orderId', description: 'Target order UUID' })
  @ApiResponse({ status: 200, description: 'Escrow refunded to buyer' })
  @ApiResponse({ status: 400, description: 'Payment not found or already refunded' })
  async refundEscrow(
    @CurrentUser('sub') userId: string,
    @Param('orderId') orderId: string,
    @Body() dto: RefundEscrowDto,
  ) {
    return this.paymentsService.refundEscrow(orderId, userId, dto.reason);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get payment records and escrow ledger entries for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  async getPaymentByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  @Get('escrow/:orderId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current escrow lifecycle status and timeline for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID' })
  async getEscrowStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getEscrowStatus(orderId);
  }
}
