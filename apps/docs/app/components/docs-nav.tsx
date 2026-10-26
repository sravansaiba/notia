'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { guideGroups } from '../lib/guides';
export function DocsNav() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const groups = guideGroups.map((group) => ({
    ...group,
    items: group.items.filter(([, title]) =>
      title.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  }));
  return (
    <aside className="docs-nav">
      <button
        className="docs-menu-button"
        aria-expanded={open}
        aria-controls="docs-menu"
        onClick={() => setOpen(!open)}
      >
        Browse documentation <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id="docs-menu" className={open ? 'docs-menu open' : 'docs-menu'}>
        <label className="docs-search">
          <span>Find a guide</span>
          <input
            type="search"
            placeholder="Search topics…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <nav aria-label="Documentation sections">
          {groups.map(
            (group) =>
              group.items.length > 0 && (
                <div className="nav-group" key={group.title}>
                  <p>{group.title}</p>
                  {group.items.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      aria-current={pathname === href ? 'page' : undefined}
                      onClick={() => {
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ),
          )}
          {groups.every((group) => !group.items.length) && (
            <p className="search-empty">
              No guide found. Try “progress”, “buttons”, or “setup”.
            </p>
          )}
        </nav>
      </div>
    </aside>
  );
}
