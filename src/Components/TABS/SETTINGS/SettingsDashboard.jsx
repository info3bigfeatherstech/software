import React from "react";
import { useSearchParams } from "react-router-dom";
import { SETTINGS_TAB_REGISTRY } from "./settingsTabRegistry";
import { filterInternalTabsByRole } from "../../../Components/roles";
import SubTabBar from "../../shared/SubTabBar";

const SettingsDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const filteredTabs = filterInternalTabsByRole("settings", SETTINGS_TAB_REGISTRY);
    const activeCtab = searchParams.get("ctab") || filteredTabs[0]?.id;
    const activeConfig = filteredTabs.find(t => t.id === activeCtab) || filteredTabs[0];
    const SubComponent = activeConfig?.component ?? null;

    const handleTabClick = (tabId) => {
        setSearchParams({ tab: "settings", ctab: tabId });
    };

    return (
        <SubTabBar
            tabs={filteredTabs}
            activeTabId={activeCtab}
            onTabClick={handleTabClick}
            parentTabId="settings"
        >
            {SubComponent
                ? <SubComponent />
                : <div className="app-loading">Sub-tab not found</div>
            }
        </SubTabBar>
    );
};

export default SettingsDashboard;
