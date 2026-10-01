import { Controller, Get, Patch, Post, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { BusinessSubRole, VerificationState, StaffRole } from '@bmb2b/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffRoles } from '../../common/decorators/staff-roles.decorator';

@ApiTags('Admin Console')
@Controller('v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('metrics')
  @StaffRoles(
    StaffRole.ANALYST,
    StaffRole.VERIFICATION_OFFICER,
    StaffRole.LISTINGS_MODERATOR,
    StaffRole.ESCROW_OFFICER,
    StaffRole.DISPUTE_MEDIATOR,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Retrieve platform KPI metrics & role liquidity balance' })
  getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get('users')
  @StaffRoles(StaffRole.VERIFICATION_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user list filtered by role & verification status' })
  getUsers(
    @Query('subRole') subRole?: BusinessSubRole,
    @Query('status') status?: VerificationState,
  ) {
    return this.adminService.getUsers(subRole, status);
  }

  @Patch('users/:id/verification')
  @StaffRoles(StaffRole.VERIFICATION_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve, reject, or request information for user verification' })
  handleVerification(
    @Param('id') userId: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO'; reason?: string },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'SUPER_ADMIN';
    return this.adminService.handleUserVerification(userId, body.action, body.reason, actorId, actorRole);
  }

  @Patch('users/:id/status')
  @StaffRoles(StaffRole.VERIFICATION_OFFICER, StaffRole.DISPUTE_MEDIATOR, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update user account status (Unverified, Pending, Verified, Under Review, Suspended, Banned)' })
  changeUserStatus(
    @Param('id') userId: string,
    @Body() body: { status: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'UNDER_REVIEW' | 'SUSPENDED' | 'BANNED'; reason: string; isFraudRelated?: boolean },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'SUPER_ADMIN';
    return this.adminService.changeUserStatus(userId, body.status, body.reason || 'Status update', Boolean(body.isFraudRelated), actorId, actorRole);
  }

  @Get('users/:id/history')
  @StaffRoles(StaffRole.VERIFICATION_OFFICER, StaffRole.DISPUTE_MEDIATOR, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user account status change history log' })
  getUserStatusHistory(@Param('id') userId: string) {
    return this.adminService.getUserStatusHistory(userId);
  }

  @Get('listings')
  @StaffRoles(
    StaffRole.LISTINGS_MODERATOR,
    StaffRole.VERIFICATION_OFFICER,
    StaffRole.ESCROW_OFFICER,
    StaffRole.DISPUTE_MEDIATOR,
    StaffRole.ANALYST,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Get product listings queue for moderation' })
  getListings(@Query('status') status?: string) {
    return this.adminService.getListings(status);
  }

  @Patch('listings/:id/action')
  @StaffRoles(
    StaffRole.LISTINGS_MODERATOR,
    StaffRole.VERIFICATION_OFFICER,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Approve, reject, flag, request fix, or bulk-remove seller listings' })
  handleListingAction(
    @Param('id') listingId: string,
    @Body() body: { action: 'APPROVE' | 'REJECT' | 'FLAG' | 'REQUEST_FIX' | 'BULK_REMOVE_SELLER'; notes?: string },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'SUPER_ADMIN';
    return this.adminService.handleListingAction(listingId, body.action, body.notes, actorId, actorRole);
  }

  @Post('categories/requests')
  @StaffRoles(
    StaffRole.LISTINGS_MODERATOR,
    StaffRole.VERIFICATION_OFFICER,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Listings Moderator: Submit request for a new top-level category' })
  submitCategoryRequest(@Body() body: { name: string; reason: string; icon?: string }, @Req() req: any) {
    const actorId = req.user?.sub;
    return this.adminService.submitCategoryRequest(body.name, body.reason, body.icon, actorId);
  }

  @Get('categories/requests')
  @StaffRoles(
    StaffRole.LISTINGS_MODERATOR,
    StaffRole.VERIFICATION_OFFICER,
    StaffRole.ESCROW_OFFICER,
    StaffRole.DISPUTE_MEDIATOR,
    StaffRole.ANALYST,
    StaffRole.SUPER_ADMIN,
  )
  @ApiOperation({ summary: 'Get list of top-level category requests' })
  getCategoryRequests() {
    return this.adminService.getCategoryRequests();
  }

  @Patch('categories/requests/:id/action')
  @StaffRoles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin: Approve and publish or reject top-level category request' })
  handleCategoryRequestAction(
    @Param('id') requestId: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; rejectionReason?: string },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'SUPER_ADMIN';
    return this.adminService.handleCategoryRequestAction(requestId, body.action, body.rejectionReason, actorId, actorRole);
  }

  @Get('escrow/transactions')
  @StaffRoles(StaffRole.ESCROW_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get live transactions and held escrow balances' })
  getEscrowTransactions() {
    return this.adminService.getEscrowTransactions();
  }

  @Post('escrow/:orderId/override')
  @StaffRoles(StaffRole.ESCROW_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Release or refund held escrow funds (Escrow Officer < 50k ETB, Super Admin any amount)' })
  handleEscrowOverride(
    @Param('orderId') orderId: string,
    @Body() body: { action: 'RELEASE' | 'REFUND' },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'SUPER_ADMIN';
    return this.adminService.handleEscrowOverride(orderId, body.action, actorId, actorRole);
  }

  @Get('disputes')
  @StaffRoles(StaffRole.DISPUTE_MEDIATOR, StaffRole.ESCROW_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get list of dispute tickets' })
  getDisputes() {
    return this.adminService.getDisputes();
  }

  @Post('disputes/:id/recommend')
  @StaffRoles(StaffRole.DISPUTE_MEDIATOR, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Dispute Mediator: Submit binding recommendation without moving money' })
  recommendDispute(
    @Param('id') disputeId: string,
    @Body() body: { recommendation: 'REFUND' | 'RELEASE' | 'SPLIT'; note: string },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'DISPUTE_MEDIATOR';
    return this.adminService.recommendDisputeResolution(disputeId, body.recommendation, body.note, actorId, actorRole);
  }

  @Post('disputes/:id/execute')
  @StaffRoles(StaffRole.ESCROW_OFFICER, StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Escrow Officer / Super Admin: Execute financial payout for dispute resolution' })
  executeDisputePayout(
    @Param('id') disputeId: string,
    @Body() body: { action: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE'; note: string },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    const actorRole = req.user?.staffRole || 'ESCROW_OFFICER';
    return this.adminService.executeDisputePayout(disputeId, body.action, body.note, actorId, actorRole);
  }

  @Get('staff')
  @StaffRoles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin: List all operational staff accounts and roles' })
  getStaffList() {
    return this.adminService.getStaffList();
  }

  @Post('staff')
  @StaffRoles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin: Create or assign staff role' })
  createOrAssignStaff(
    @Body() body: { fullName: string; phone: string; email: string; password?: string; staffRole: StaffRole },
    @Req() req: any,
  ) {
    const actorId = req.user?.sub;
    return this.adminService.createOrAssignStaff(body, actorId);
  }

  @Delete('staff/:id')
  @StaffRoles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin: Revoke staff access' })
  revokeStaff(@Param('id') staffUserId: string, @Req() req: any) {
    const actorId = req.user?.sub;
    return this.adminService.revokeStaff(staffUserId, actorId);
  }

  @Get('audit-logs')
  @StaffRoles(StaffRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Super Admin: View system administrative audit trail logs' })
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }
}
