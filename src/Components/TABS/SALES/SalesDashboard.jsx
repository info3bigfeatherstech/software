import React from "react";
import { useSearchParams } from "react-router-dom";
import { SALES_TAB_REGISTRY } from "./salesTabRegistry";
import { filterInternalTabsByRole } from "../../../Components/roles";
import { useSelector } from "react-redux";
import SubTabBar from "../../shared/SubTabBar";

const SalesDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    useSelector((state) => state.auth);

    const filteredTabs = filterInternalTabsByRole("sales", SALES_TAB_REGISTRY);
    const activeCtab = searchParams.get("ctab") || filteredTabs[0]?.id;
    const activeConfig = filteredTabs.find(t => t.id === activeCtab) || filteredTabs[0];
    const SubComponent = activeConfig?.component ?? null;

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: "sales", ctab: tabId });
    };

    return (
        <SubTabBar
            tabs={filteredTabs}
            activeTabId={activeCtab}
            onTabClick={handleTabClick}
            parentTabId="sales"
        >
            {SubComponent
                ? <SubComponent />
                : <div className="app-loading">Sub-tab not found</div>
            }
        </SubTabBar>
    );
};

export default SalesDashboard;
