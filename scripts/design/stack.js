/*
 * stack.js: design-layer motion for the stack area (Instrument redesign v5). Owner: W5 activity+stack.
 * Called once from scripts/design/index.js after the core modules are up. Must never throw; no-op if hooks are absent.
 * Respect reduced motion (import { reducedMotion } from '../core/motion.js' or check matchMedia yourself).
 */
export function init() {
  try {
    const schema = document.querySelector('[data-schema]');
    if (!schema) return;

    const section = schema.closest('section') || document;
    const statusEl = section.querySelector('[data-schema-status]');
    const tables = [...schema.querySelectorAll('.stack__table')];
    const rows = [...schema.querySelectorAll('tbody tr[data-join]')];
    if (!rows.length) return;

    const meta = new Map();
    for (const row of rows) {
      if (!row.hasAttribute('tabindex')) row.setAttribute('tabindex', '0');
      const tags = (row.dataset.join || '').trim().split(/\s+/).filter(Boolean);
      const table = row.closest('.stack__table');
      const name = row.querySelector('td')?.textContent?.trim() || '';
      meta.set(row, { tags, table, name });
    }

    let locked = null;

    const applyJoin = (sourceRow) => {
      schema.classList.toggle('is-joining', !!sourceRow);
      const sourceTags = sourceRow ? meta.get(sourceRow).tags : [];
      const hitTables = new Set();
      const matchedTags = new Set();
      let matchCount = 0;

      for (const row of rows) {
        const isSource = row === sourceRow;
        const info = meta.get(row);
        const shared = sourceRow && !isSource
          ? info.tags.filter((t) => sourceTags.includes(t))
          : [];
        const isJoined = shared.length > 0;

        row.classList.toggle('is-source', isSource);
        row.classList.toggle('is-joined', isJoined);

        if (isSource || isJoined) hitTables.add(info.table);
        if (isJoined) {
          matchCount += 1;
          for (const t of shared) matchedTags.add(t);
        }
      }

      for (const table of tables) {
        table.classList.toggle('has-join', hitTables.has(table));
      }

      if (statusEl) {
        if (!sourceRow) {
          statusEl.textContent = '';
        } else {
          const keys = [...(matchedTags.size ? matchedTags : sourceTags)].join(', ');
          statusEl.textContent = `${meta.get(sourceRow).name} · JOIN (${keys}) · ${matchCount} related across ${hitTables.size} tables`;
        }
      }
    };

    for (const row of rows) {
      row.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse' && !locked) applyJoin(row);
      });
      row.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && !locked) applyJoin(null);
      });
      row.addEventListener('focus', () => {
        if (!locked) applyJoin(row);
      });
      row.addEventListener('blur', (e) => {
        if (locked) return;
        const next = e.relatedTarget;
        if (!next || !schema.contains(next)) {
          requestAnimationFrame(() => {
            if (!locked && !schema.contains(document.activeElement)) applyJoin(null);
          });
        }
      });
      row.addEventListener('click', () => {
        locked = locked === row ? null : row;
        applyJoin(locked);
      });
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          locked = locked === row ? null : row;
          applyJoin(locked || row);
          return;
        }
        if (e.key === 'Escape') {
          if (locked || schema.classList.contains('is-joining')) {
            e.preventDefault();
            locked = null;
            applyJoin(null);
          }
          return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const tableRows = [...(row.closest('tbody')?.querySelectorAll('tr[data-join]') || [])];
          const idx = tableRows.indexOf(row);
          if (idx === -1) return;
          e.preventDefault();
          const nextIdx = e.key === 'ArrowDown'
            ? (idx + 1) % tableRows.length
            : (idx - 1 + tableRows.length) % tableRows.length;
          tableRows[nextIdx]?.focus();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (locked && !schema.contains(e.target)) {
        locked = null;
        applyJoin(null);
      }
    });
  } catch {}
}
