// The "Overview" tab inside Dashboard.js: the fragment-screening campaigns of
// the project whose tab is selected in core's ProjectTabs above. Placeholder list - there
// is no way to create a campaign yet. Only ever touches core through the
// coreApi prop (docs/MFF-Core_module-core-api.md).
import React, { useEffect, useState } from 'react';
import styles from '../styles/OverviewTab.module.css';

const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '13px', backgroundColor: '#f8f9fa' };
const tdStyle = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '13px' };

// Fallbacks for a core older than the shared sortable-table helpers (v0.1.223).
const useUnsortedRows = rows => ({ rows });
function PlainHeader({ table, column, label, ...thProps }) {
  return <th {...thProps} />;
}

const NO_CAMPAIGNS = [];

function OverviewTab({ coreApi, selection }) {
  const { api } = coreApi;
  // Nothing project-specific until ProjectTabs has loaded.
  const projectId = selection && selection.ready ? selection.projectId : null;
  // Which one is used is fixed for the whole session, so hook order is stable.
  const useSortedRows = coreApi.useSortedRows || useUnsortedRows;
  const SortHeader = (coreApi.ui && coreApi.ui.SortHeader) || PlainHeader;
  // The answer is kept together with the project it belongs to, so one
  // project's campaigns are never shown under another.
  const [result, setResult] = useState({ projectId: null, rows: NO_CAMPAIGNS, error: '' });

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    api.get('/xchem/campaigns', { params: { project_id: projectId } })
      .then(res => { if (!cancelled) setResult({ projectId, rows: res.data, error: '' }); })
      .catch(err => { if (!cancelled) setResult({ projectId, rows: NO_CAMPAIGNS, error: err.response?.data?.error || err.message }); });
    return () => { cancelled = true; };
  }, [api, projectId]);

  const current = Boolean(projectId) && result.projectId === projectId;
  const table = useSortedRows(current ? result.rows : NO_CAMPAIGNS, {
    title: c => c.title,
    status: c => c.status,
    created: { value: c => c.created_at, type: 'date' }
  }, { rememberAs: 'xchem.campaigns.table', defaultSort: null });

  if (!selection || !selection.ready) return null; // ProjectTabs shows loading / error itself
  if (!projectId) return <p className={styles.empty}>No project to show campaigns for.</p>;
  if (!current) return <div className={styles.loading}>Loading...</div>;
  if (result.error) return <div className={styles.error}>{result.error}</div>;

  return (
    <div className={styles.container}>
      <h3>Fragment-screening campaigns</h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <SortHeader table={table} column="title" label="Campaign" style={thStyle}>Campaign</SortHeader>
            <SortHeader table={table} column="status" label="Status" style={thStyle}>Status</SortHeader>
            <SortHeader table={table} column="created" label="Created" style={thStyle}>Created</SortHeader>
          </tr>
        </thead>
        <tbody>
          {table.rows.map(c => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.title}</td>
              <td style={tdStyle}>{c.status}</td>
              <td style={tdStyle}>{new Date(c.created_at).toLocaleDateString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length === 0 && <p className={styles.empty}>No campaigns in this project yet.</p>}
    </div>
  );
}

export default OverviewTab;
