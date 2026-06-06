import React from "react";
import CashBankPageShell, { EmptyState, PhaseNotice } from "../shared/CashBankPageShell";

export default function WarehouseBankStatementTab() {
    return (
        <CashBankPageShell
            title="Bank Statement (Warehouse)"
            subtitle="Warehouse bank account activity — vendor payments and transfers"
        >
            <PhaseNotice>
                Warehouse bank accounts and transaction ledger will be added in Phase 2.
                Vendor payments and operating expenses paid from warehouse bank will appear here.
            </PhaseNotice>
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    message="No warehouse bank transactions yet"
                    detail="Configure warehouse bank accounts in Settings, then link vendor payments."
                />
            </div>
        </CashBankPageShell>
    );
}
