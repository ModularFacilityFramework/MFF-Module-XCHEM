import React, { useEffect, useRef, useState } from 'react';
import { usePageState } from '../usePageState';

const wrapperStyle = { border: '1px solid #ddd', borderRadius: '4px', overflow: 'auto' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const theadStyle = { backgroundColor: '#f8f9fa' };
const thStyle = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '13px' };
const tdStyle = { padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee', fontSize: '13px' };
const loadingStyle = { textAlign: 'center', padding: '20px' };
const errorStyle = { textAlign: 'center', padding: '20px', color: 'red', backgroundColor: '#ffeeee', borderRadius: '4px', margin: '10px 0' };
const hintStyle = { fontSize: '12px', color: '#856404', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '8px 12px', display: 'inline-block', marginBottom: '12px' };
const saveButtonStyle = { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', backgroundColor: '#007bff', marginTop: '12px' };
const savedChipStyle = { display: 'inline-block', padding: '2px 6px', margin: '0 0 0 10px', borderRadius: '3px', fontSize: '11px', color: 'white', backgroundColor: '#28a745' };

function PageAccessTab({ coreApi }) {
  const { api, useAuth, useRoles } = coreApi;
  const { userData } = useAuth();
  const { canManageUsers } = useRoles(userData);
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [access, setAccess] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  // Unsaved role-grid edits are a form draft: kept across leaving the tab and
  // reloads (per user) until saved, so a half-done edit isn't lost. null = no draft.
  const [draft, setDraft, resetDraft] = usePageState(coreApi, 'xchem.pageAccess.draft', null, v => v === null || (typeof v === 'object' && !Array.isArray(v)));
  const initialDraft = useRef(draft);

  useEffect(() => {
    api.get('/xchem/page-access')
      .then(res => {
        setPages(res.data.pages);
        setRoles(res.data.roles);
        // Restore the draft over the server copy; the server ignores unknown
        // roles/pages on save, so a stale draft can't cause an error.
        setAccess(initialDraft.current && typeof initialDraft.current === 'object' ? initialDraft.current : res.data.access);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [api]);

  function toggleRole(pageKey, role) {
    if (!canManageUsers) return;
    setSaved(false);
    const current = access[pageKey] || [];
    const nextRoles = current.includes(role) ? current.filter(r => r !== role) : [...current, role];
    const nextAccess = { ...access, [pageKey]: nextRoles };
    setAccess(nextAccess);
    setDraft(nextAccess);
  }

  function handleSave() {
    setSaving(true);
    setError('');
    api.put('/xchem/page-access', { access })
      .then(() => { setSaved(true); resetDraft(); })
      .catch(err => setError(err.message))
      .finally(() => setSaving(false));
  }

  if (loading) return <div style={loadingStyle}>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div>
      {!canManageUsers && <p style={hintStyle}>Read-only - only staff-level users in this module can change page access.</p>}
      <div style={wrapperStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}><tr><th style={thStyle}>Page</th>{roles.map(role => <th key={role} style={thStyle}>{role}</th>)}</tr></thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.key}>
                <td style={tdStyle}>{page.label}</td>
                {roles.map(role => (
                  <td key={role} style={tdStyle}>
                    <input type="checkbox" checked={(access[page.key] || []).includes(role)} disabled={!canManageUsers} onChange={() => toggleRole(page.key, role)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canManageUsers && (
        <div>
          <button style={saveButtonStyle} onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          {saved && <span style={savedChipStyle}>Saved</span>}
        </div>
      )}
    </div>
  );
}
export default PageAccessTab;
