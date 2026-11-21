// Page-state persistence for this module (rule: every page, tab and sub-tab
// keeps its selections, filters, drafts etc. across leaving the page and
// reloading, per user).
//
// Every piece of persisted UI state in this module goes through this one thin
// wrapper over core's shared helper `coreApi.usePageState` (per user, saved in
// the browser at once and on the server, survives reload and logout).
//
//   const [value, setValue, reset] = usePageState(coreApi, 'xchem.page.what', initial, validate);
//
// - key: `xchem.<page>.<what>` (optionally `:id`), always starts with this module's id.
// - initial: fallback when nothing is saved yet.
// - validate (optional): array of allowed values, or function(value) => boolean;
//   a saved value that fails it silently falls back to `initial`.
// - reset: forgets the saved value (call after a successful save / cancel).
//
// If core is older and has no usePageState, falls back to plain useState
// (nothing persisted, page still works). The choice is fixed for the whole
// session, so the hook order never changes between renders.
import { useState } from 'react';

function useLocalState(initial) {
  const [value, setValue] = useState(initial);
  const reset = () => setValue(initial);
  return [value, setValue, reset];
}

export function usePageState(coreApi, key, initial, validate) {
  /* eslint-disable react-hooks/rules-of-hooks */
  if (coreApi && typeof coreApi.usePageState === 'function') {
    return coreApi.usePageState(key, initial, validate);
  }
  return useLocalState(initial);
  /* eslint-enable react-hooks/rules-of-hooks */
}
