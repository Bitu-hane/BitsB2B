import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 1. Initiate Payment & Setup Escrow Hold Record
   * Creates record in Table 16: payments & Table 18: escrow_transactions
   */
  async initiatePayment(dto: InitiatePaymentDto, userId?: string) {
    this.logger.log(`Initiating payment for order: ${dto.orderId} via ${dto.provider}`);

    // Verify target order exists
    const orderRows = await this.dataSource.query(
      `SELECT id, order_number, total_amount, currency, status, buyer_business_id, seller_business_id
       FROM orders WHERE id = $1`,
      [dto.orderId],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    const order = orderRows[0];
    const idempotencyKey = dto.idempotencyKey || `idem-${dto.orderId}-${Date.now()}`;

    // Check for existing payment with this idempotency key
    const existingPayment = await this.dataSource.query(
      `SELECT * FROM payments WHERE idempotency_key = $1`,
      [idempotencyKey],
    );

    if (existingPayment && existingPayment.length > 0) {
      return {
        message: 'Payment already initiated',
        payment: existingPayment[0],
      };
    }

    // Generate provider transaction reference
    const prefix = dto.provider.toUpperCase().substring(0, 3);
    const providerTxnId = `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Insert payment record
    const paymentRows = await this.dataSource.query(
      `INSERT INTO payments (
        order_id,
        idempotency_key,
        provider,
        payment_method,
        provider_transaction_id,
        amount,
        currency,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *`,
      [
        dto.orderId,
        idempotencyKey,
        dto.provider,
        dto.paymentMethod,
        providerTxnId,
        dto.amount,
        dto.currency || 'ETB',
      ],
    );

    const payment = paymentRows[0];

    // Setup Initial Escrow Transaction with 'hold' type
    const operationRef = `ESC-HOLD-${payment.id.substring(0, 8)}-${Date.now()}`;
    const escrowRows = await this.dataSource.query(
      `INSERT INTO escrow_transactions (
        order_id,
        payment_id,
        operation_reference,
        type,
        amount,
        status,
        provider_reference
      ) VALUES ($1, $2, $3, 'hold', $4, 'initiated', $5)
      RETURNING *`,
      [
        dto.orderId,
        payment.id,
        operationRef,
        dto.amount,
        providerTxnId,
      ],
    );

    // Generate Provider-specific payment instructions (e.g. Telebirr USSD push / QR)
    let paymentInstructions: Record<string, any> = {};
    if (dto.provider === 'telebirr') {
      paymentInstructions = {
        action: 'USSD_PUSH_PROMPT',
        phone: dto.phoneNumber || '+251911223344',
        ussdCode: '*127#',
        qrPayload: `telebirr://pay?ref=${providerTxnId}&amount=${dto.amount}&biz=BitsB2B`,
        expiresInSeconds: 600,
      };
    } else if (dto.provider === 'cbe_birr') {
      paymentInstructions = {
        action: 'CBE_BIRR_TRANSFER',
        shortCode: '884422',
        accountNumber: '1000189283741',
        paymentReference: providerTxnId,
        expiresInSeconds: 1800,
      };
    } else {
      paymentInstructions = {
        action: 'BANK_WIRE_TRANSFER',
        beneficiary: 'BitsB2B Digital Marketplace Escrow Account',
        bank: 'Commercial Bank of Ethiopia',
        accountNumber: '1000189283741',
        referenceNote: order.order_number,
      };
    }

    return {
      success: true,
      message: 'Payment initiation submitted to escrow ledger',
      payment,
      escrow: escrowRows[0],
      paymentInstructions,
    };
  }

  /**
   * 2. Process Fintech Webhook Events (Telebirr & CBE Birr Callback)
   * Idempotently writes to Table 17: payment_provider_events & updates Table 16/18
   */
  async handleWebhook(dto: PaymentWebhookDto) {
    this.logger.log(`Received webhook from ${dto.provider} for txn ${dto.providerTransactionId}`);

    // Idempotently record incoming provider webhook event
    const eventRows = await this.dataSource.query(
      `INSERT INTO payment_provider_events (
        provider,
        provider_event_id,
        event_type,
        payload,
        processing_status
      ) VALUES ($1, $2, $3, $4, 'received')
      RETURNING id`,
      [
        dto.provider,
        dto.providerEventId,
        dto.eventType,
        JSON.stringify(dto.payload || {}),
      ],
    );
    const eventId = eventRows[0].id;

    // Locate related payment record
    const paymentRows = await this.dataSource.query(
      `SELECT * FROM payments 
       WHERE provider = $1 AND provider_transaction_id = $2`,
      [dto.provider, dto.providerTransactionId],
    );

    if (!paymentRows || paymentRows.length === 0) {
      this.logger.warn(`No matching payment found for provider txn ${dto.providerTransactionId}`);
      await this.dataSource.query(
        `UPDATE payment_provider_events SET processing_status = 'unmatched' WHERE id = $1`,
        [eventId],
      );
      return { success: false, message: 'Unmatched transaction' };
    }

    const payment = paymentRows[0];

    if (dto.status === 'completed') {
      // 1. Mark Payment as completed
      await this.dataSource.query(
        `UPDATE payments 
         SET status = 'completed', paid_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.id],
      );

      // 2. Mark Escrow Hold transaction as completed (Funds safely locked in escrow)
      await this.dataSource.query(
        `UPDATE escrow_transactions 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE payment_id = $1 AND type = 'hold'`,
        [payment.id],
      );

      // 3. Advance Order status to escrow_funded
      await this.dataSource.query(
        `UPDATE orders 
         SET status = 'escrow_funded', confirmed_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [payment.order_id],
      );

      // 4. Mark Webhook event as processed
      await this.dataSource.query(
        `UPDATE payment_provider_events 
         SET payment_id = $1, processing_status = 'processed', processed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [payment.id, eventId],
      );

      return { success: true, status: 'completed', orderId: payment.order_id };
    } else {
      // Mark Payment as failed
      await this.dataSource.query(
        `UPDATE payments 
         SET status = 'failed', failure_reason = $1, failed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [dto.failureReason || 'Provider reported payment failure', payment.id],
      );

      await this.dataSource.query(
        `UPDATE payment_provider_events 
         SET payment_id = $1, processing_status = 'failed', processed_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [payment.id, eventId],
      );

      return { success: true, status: 'failed' };
    }
  }

  /**
   * 3. Release Escrow Funds to Seller (Upon Buyer Confirmation of Delivery)
   */
  async releaseEscrow(orderId: string, userId: string, notes?: string) {
    this.logger.log(`Releasing escrow funds for order: ${orderId} by user: ${userId}`);

    // Verify order exists
    const orderRows = await this.dataSource.query(
      `SELECT id, order_number, status, total_amount FROM orders WHERE id = $1`,
      [orderId],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    const order = orderRows[0];

    // Find successful payment for order
    const paymentRows = await this.dataSource.query(
      `SELECT * FROM payments WHERE order_id = $1 AND status = 'completed'`,
      [orderId],
    );

    if (!paymentRows || paymentRows.length === 0) {
      throw new BadRequestException('No completed payment found in escrow for this order');
    }
    const payment = paymentRows[0];

    // Verify funds held in escrow
    const holdRows = await this.dataSource.query(
      `SELECT * FROM escrow_transactions 
       WHERE order_id = $1 AND type = 'hold' AND status = 'completed'`,
      [orderId],
    );

    if (!holdRows || holdRows.length === 0) {
      throw new BadRequestException('Escrow funds have not been verified and held yet');
    }

    // Check if already released
    const releaseCheck = await this.dataSource.query(
      `SELECT * FROM escrow_transactions 
       WHERE order_id = $1 AND type = 'release_to_seller' AND status = 'completed'`,
      [orderId],
    );

    if (releaseCheck && releaseCheck.length > 0) {
      throw new BadRequestException('Escrow funds have already been released to seller');
    }

    // Record release in Escrow Ledger
    const operationRef = `ESC-REL-${payment.id.substring(0, 8)}-${Date.now()}`;
    const releaseRows = await this.dataSource.query(
      `INSERT INTO escrow_transactions (
        order_id,
        payment_id,
        operation_reference,
        type,
        amount,
        status,
        provider_reference,
        completed_at
      ) VALUES ($1, $2, $3, 'release_to_seller', $4, 'completed', $5, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        orderId,
        payment.id,
        operationRef,
        payment.amount,
        notes || 'Delivered and verified by buyer',
      ],
    );

    // Update order status to delivered
    await this.dataSource.query(
      `UPDATE orders 
       SET status = 'delivered', delivered_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId],
    );

    // Audit transition in order_status_history
    await this.dataSource.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by_user_id)
       VALUES ($1, $2, 'delivered', $3)`,
      [orderId, order.status, userId],
    );

    return {
      success: true,
      message: 'Escrow funds successfully released to seller',
      escrowRelease: releaseRows[0],
    };
  }

  /**
   * 4. Refund Escrow Funds to Buyer (Cancellation or Dispute Resolution)
   */
  async refundEscrow(orderId: string, userId: string, reason?: string) {
    this.logger.log(`Refunding escrow funds for order: ${orderId} by user: ${userId}`);

    const orderRows = await this.dataSource.query(
      `SELECT id, order_number, status FROM orders WHERE id = $1`,
      [orderId],
    );

    if (!orderRows || orderRows.length === 0) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    const order = orderRows[0];

    const paymentRows = await this.dataSource.query(
      `SELECT * FROM payments WHERE order_id = $1 AND status = 'completed'`,
      [orderId],
    );

    if (!paymentRows || paymentRows.length === 0) {
      throw new BadRequestException('No completed payment found in escrow to refund');
    }
    const payment = paymentRows[0];

    // Check if already refunded
    const refundCheck = await this.dataSource.query(
      `SELECT * FROM escrow_transactions 
       WHERE order_id = $1 AND type = 'refund_to_buyer' AND status = 'completed'`,
      [orderId],
    );

    if (refundCheck && refundCheck.length > 0) {
      throw new BadRequestException('Escrow funds have already been refunded to buyer');
    }

    const operationRef = `ESC-REF-${payment.id.substring(0, 8)}-${Date.now()}`;
    const refundRows = await this.dataSource.query(
      `INSERT INTO escrow_transactions (
        order_id,
        payment_id,
        operation_reference,
        type,
        amount,
        status,
        provider_reference,
        completed_at
      ) VALUES ($1, $2, $3, 'refund_to_buyer', $4, 'completed', $5, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        orderId,
        payment.id,
        operationRef,
        payment.amount,
        reason || 'Cancelled by buyer/admin',
      ],
    );

    // Update payment status to refunded
    await this.dataSource.query(
      `UPDATE payments SET status = 'refunded' WHERE id = $1`,
      [payment.id],
    );

    // Update order status to cancelled
    await this.dataSource.query(
      `UPDATE orders SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [orderId],
    );

    // Record in history
    await this.dataSource.query(
      `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by_user_id)
       VALUES ($1, $2, 'cancelled', $3)`,
      [orderId, order.status, userId],
    );

    return {
      success: true,
      message: 'Escrow funds successfully refunded to buyer account',
      escrowRefund: refundRows[0],
    };
  }

  /**
   * 5. Get Payment Details for Order
   */
  async getPaymentByOrderId(orderId: string) {
    const paymentRows = await this.dataSource.query(
      `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId],
    );

    const escrowRows = await this.dataSource.query(
      `SELECT * FROM escrow_transactions WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId],
    );

    return {
      payments: paymentRows,
      escrowLedger: escrowRows,
    };
  }

  /**
   * 6. Get Escrow Status Overview
   */
  async getEscrowStatus(orderId: string) {
    const escrowRows = await this.dataSource.query(
      `SELECT * FROM escrow_transactions WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId],
    );

    const isHeld = escrowRows.some(e => e.type === 'hold' && e.status === 'completed');
    const isReleased = escrowRows.some(e => e.type === 'release_to_seller' && e.status === 'completed');
    const isRefunded = escrowRows.some(e => e.type === 'refund_to_buyer' && e.status === 'completed');

    let currentPhase = 'UNFUNDED';
    if (isRefunded) currentPhase = 'REFUNDED';
    else if (isReleased) currentPhase = 'RELEASED_TO_SELLER';
    else if (isHeld) currentPhase = 'HELD_IN_ESCROW';
    else if (escrowRows.some(e => e.type === 'hold')) currentPhase = 'INITIATED';

    return {
      orderId,
      currentPhase,
      transactions: escrowRows,
    };
  }
}
