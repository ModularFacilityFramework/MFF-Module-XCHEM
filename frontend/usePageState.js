// Page-state persistence for this module (user's rule: every page, tab and
// sub-tab keeps its selections, filters, drafts etc. across leaving the page
// and reloading, per user).
//
// Every piece of persisted UI state in this module goes through this one hook,
// so the storage backend lives in exactly one place.
//
// INTERIM BACKEND: mff-core is providing a shared page-state helper (state per
// user, surviving reload and logout). Until it is published this stores in the
// browser's localStorage, keyed by module id + user id, so state is already
// per user and survives leave / reload / logout in the same browser. When
// core's helper arrives, only the body of this file changes - callers keep
// using `usePageState(coreApi, key, initialValue)` unchanged.
import { useCallback, useEffect, useState } from 'react';
import manifest from '../module.manifest.json';

function storageKey(userId, key) {
  return `mff:${manifest.id}:${userId}:${key}`;
}

function readStored(userId, key, fallback) {
  if (userId == null) return fallback;
  try {
    const raw = window.localStorage.getItem(storageKey(userId, key));
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    return fallback; // storage blocked or value corrupt - never an error for the user
  }
}

function writeStored(userId, key, value) {
  if (userId == null) return;
  try {
    window.localStorage.setItem(storageKey(userId, key), JSON.stringify(value === undefined ? null : value));
  } catch (err) {
    // storage full/blocked: state just stops persisting, the page keeps working
  }
}

// Same shape as useState: const [value, setValue] = usePageState(coreApi, 'activeTab', null).
// `key` must be unique within this module; `initialValue` is the fallback when
// nothing is saved yet. setValue accepts a value or an updater function.
export function usePageState(coreApi, key, initialValue) {
  const { userData } = coreApi.useAuth();
  const userId = userData && userData.user ? userData.user.id : null;
  const [value, setValue] = useState(() => readStored(userId, key, initialValue));

  // The logged-in user can change while this component stays mounted
  // (logout/login): load that user's own saved value, not the previous one's.
  useEffect(() => {
    setValue(readStored(userId, key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key]);

  const set = useCallback(next => {
    setValue(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      writeStored(userId, key, resolved);
      return resolved;
    });
  }, [userId, key]);

  return [value, set];
}
