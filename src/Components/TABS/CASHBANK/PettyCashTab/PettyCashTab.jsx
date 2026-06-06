import React from "react";
import CashBankPageShell, { EmptyState, PhaseNotice } from "../shared/CashBankPageShell";

export default function PettyCashTab() {
    return (
        <CashBankPageShell
            title="Petty Cash"
            subtitle="Small warehouse cash float for local expenses"
        >
            <PhaseNotice>
                Warehouse petty cash is a lite cash book for transport, loading, and small vendor cash purchases.
                Manual entry and reconciliation will be added in Phase 2.
            </PhaseNotice>
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    message="No petty cash entries yet"
                    detail="This is not the shop counter cash drawer — use Cash In Hand at shop level for billing collections."
                />
            </div>
        </CashBankPageShell>
    );
}
