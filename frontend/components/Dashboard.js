// This module's top-level content - the component actually passed to
// registerDashboardTab/registerMenuPage in frontend/index.js. Renders inside
// core's own Dashboard content wrapper (registerDashboardTab case) or inside
// the persistent shell (registerMenuPage case) - either way core already
// applies the outer page padding/background, so this component starts
// directly with its own sub-tab bar, no full-page wrapper of its own. See
// docs/MFF-Core_module-ui-guide.md (sub-tab bar pattern) for where these style values
// come from - they're not invented, they match core's own Setup tab
// (Preferences/File Upload) exactly, so this stays visually native.
//
// Add a new tab here for every real page/section this module grows -
// OverviewTab is this template's one example tab, PageAccessTab is a
// genuinely reusable pattern (gate this module's own tabs by role), not
// template filler - keep it as new tabs get added.
import React, { useEffect, useState } from 'react';
import OverviewTab from './OverviewTab';
import PageAccessTab from './PageAccessTab';

// 'page-access' is deliberately not in here - it's staff-only by the same
// canManageUsers check that gates editing it in PageAccessTab.js, not
// something the access list itself can grant/revoke.
const TABS = [
  { key: 'overview', label: 'Overview', component: OverviewTab }
];

const tabBarStyle = {
  display: 'flex',
  borderBottom: '1px solid #dee2e6',
  marginBottom: '20px',
  backgroundColor: '#f8f9fa'
};

function tabStyle(isActive) {
  return {
    padding: '10px 20px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    borderBottom: isActive ? '2px solid #007bff' : 'none',
    fontWeight: isActive ? 'bold' : 'normal',
    border: isActive ? '1px solid #dee2e6' : 'none',
    fontSize: '13px'
  };
}

const contentPanelStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  border: '1px solid #dee2e6',
  borderRadius: '0 0 4px 4px'
};

const loadingStyle = { textAlign: 'center', padding: '20px' };

function Dashboard({ coreApi }) {
  const { api, useAuth, useRoles } = coreApi;
  const { userData } = useAuth();
  const { canManageUsers, roles: userRoles } = useRoles(userData);

  // PageAccessTab.js writes this same config - staff always see every tab
  // (same as elsewhere in this module), everyone else only sees a tab once
  // one of their roles has been explicitly granted it there.
  const [access, setAccess] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    api.get('/example/page-access')
      .then(res => setAccess(res.data.access))
      .catch(() => setAccess({}));
  }, [api]);

  if (access === null) return <div style={loadingStyle}>Loading...</div>;

  const visibleTabs = TABS.filter(
    tab => canManageUsers || (access[tab.key] || []).some(role => userRoles.includes(role))
  );
  if (canManageUsers) visibleTabs.push({ key: 'page-access', label: 'Page Access', component: PageAccessTab });

  const currentTab = visibleTabs.find(t => t.key === activeTab) || visibleTabs[0];
  if (!currentTab) return <div style={loadingStyle}>You don't have access to any tab in this module.</div>;
  const ActiveComponent = currentTab.component;

  return (
    <div>
      <div style={tabBarStyle}>
        {visibleTabs.map(tab => (
          <div
            key={tab.key}
            style={tabStyle(tab.key === currentTab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div style={contentPanelStyle}>
        <ActiveComponent coreApi={coreApi} />
      </div>
    </div>
  );
}

export default Dashboard;
