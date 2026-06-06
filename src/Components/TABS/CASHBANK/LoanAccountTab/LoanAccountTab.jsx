import React from "react";
import CashBankPageShell, { EmptyState, PhaseNotice } from "../shared/CashBankPageShell";

export default function LoanAccountTab() {
    return (
        <CashBankPageShell
            title="Loan Accounts"
            subtitle="Business loans, EMIs and outstanding balances — organisation level"
        >
            <PhaseNotice>
                Loan tracking is a Phase 3 feature. Business loans are typically managed at company/HO level,
                optionally tagged to a shop or warehouse for working capital allocation.
            </PhaseNotice>
            <div className="bg-white rounded-xl border border-gray-200">
                <EmptyState
                    message="No loans recorded"
                    detail="Super Admin can manage organisation-level loans when this module is enabled."
                />
            </div>
        </CashBankPageShell>
    );
}
