import React from "react";
import CashBankPageShell, { EmptyState, PhaseNotice } from "../shared/CashBankPageShell";

export default function ChequesReceivedTab() {
    return (
        <CashBankPageShell
            title="Cheques Received"
            subtitle="Customer cheques received at shop — track deposit and clearance"
        >
            <PhaseNotice>
                Cheque register will be available in Phase 2. Use Collections for cash/UPI/card payments today.
                When enabled: track cheque number, customer, bank, amount, deposit date, and status (Pending / Cleared / Bounced).
            </PhaseNotice>
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    message="No cheques recorded yet"
                    detail="Received cheques from B2B customers will appear here once the cheque module is enabled."
                />
            </div>
        </CashBankPageShell>
    );
}
