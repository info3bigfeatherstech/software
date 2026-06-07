import React from "react";
import { useSearchParams } from "react-router-dom";
import { INVENTORY_TAB_REGISTRY } from "./inventoryTabRegistry";
import { filterInternalTabsByRole } from "../../../Components/roles";
import { useSelector } from "react-redux";
import SubTabBar from "../../shared/SubTabBar";

const InventoryDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    useSelector((state) => state.auth);

    const filteredTabs = filterInternalTabsByRole("inventory", INVENTORY_TAB_REGISTRY);
    const activeCtab = searchParams.get("ctab") || filteredTabs[0]?.id;
    const activeConfig = filteredTabs.find(t => t.id === activeCtab) || filteredTabs[0];
    const SubComponent = activeConfig?.component ?? null;

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: "inventory", ctab: tabId });
    };

    return (
        <SubTabBar
            tabs={filteredTabs}
            activeTabId={activeCtab}
            onTabClick={handleTabClick}
            parentTabId="inventory"
        >
            {SubComponent
                ? <SubComponent />
                : <div className="app-loading">Sub-tab not found</div>
            }
        </SubTabBar>
    );
};

export default InventoryDashboard;
