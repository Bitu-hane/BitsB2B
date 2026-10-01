"use strict";
// Common domain types shared across BitsB2B Web frontend & NestJS backend
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCROW_RELEASE_THRESHOLD_ETB = exports.VerificationState = exports.BusinessSubRole = exports.StaffRole = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["BUYER"] = "BUYER";
    UserRole["SELLER"] = "SELLER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var StaffRole;
(function (StaffRole) {
    StaffRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    StaffRole["VERIFICATION_OFFICER"] = "VERIFICATION_OFFICER";
    StaffRole["LISTINGS_MODERATOR"] = "LISTINGS_MODERATOR";
    StaffRole["ESCROW_OFFICER"] = "ESCROW_OFFICER";
    StaffRole["DISPUTE_MEDIATOR"] = "DISPUTE_MEDIATOR";
    StaffRole["ANALYST"] = "ANALYST";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
var BusinessSubRole;
(function (BusinessSubRole) {
    BusinessSubRole["IMPORTER"] = "importer";
    BusinessSubRole["EXPORTER"] = "exporter";
    BusinessSubRole["PRODUCER"] = "producer";
    BusinessSubRole["WHOLESALER"] = "wholesaler";
    BusinessSubRole["DISTRIBUTOR"] = "distributor";
    BusinessSubRole["RESELLER"] = "reseller";
    BusinessSubRole["INSTITUTIONAL_BUYER"] = "institutional_buyer";
})(BusinessSubRole || (exports.BusinessSubRole = BusinessSubRole = {}));
var VerificationState;
(function (VerificationState) {
    VerificationState["PENDING_REVIEW"] = "PENDING_REVIEW";
    VerificationState["VERIFIED"] = "VERIFIED";
    VerificationState["REJECTED"] = "REJECTED";
    VerificationState["MORE_INFO_NEEDED"] = "MORE_INFO_NEEDED";
    VerificationState["SUSPENDED"] = "SUSPENDED";
    VerificationState["REVOKED"] = "REVOKED";
})(VerificationState || (exports.VerificationState = VerificationState = {}));
exports.ESCROW_RELEASE_THRESHOLD_ETB = 500000;
//# sourceMappingURL=index.js.map