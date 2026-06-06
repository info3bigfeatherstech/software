import React from "react";
import CashBankPageShell, { EmptyState, PhaseNotice } from "../shared/CashBankPageShell";

export default function ChequesIssuedTab() {
    return (
        <CashBankPageShell
            title="Cheques Issued"
            subtitle="Cheques issued to vendors from warehouse — track clearance"
        >
            <PhaseNotice>
                Issued cheque tracking will be linked to vendor payments in Phase 2.
                Warehouse managers will record cheque number, vendor, amount, and status (Issued / Cleared / Bounced).
            </PhaseNotice>
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    message="No issued cheques recorded yet"
                    detail="Vendor payment vouchers with cheque mode will populate this register."
                />
            </div>
        </CashBankPageShell>
    );
}
