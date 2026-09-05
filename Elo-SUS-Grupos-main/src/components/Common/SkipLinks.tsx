/**
 * Skip Links - Acessibilidade para keyboard users
 * Permite pular para conteúdo principal (evita tabbing pelo menu)
 * WCAG 2.1 AA: Level 2.4.1 Bypass Blocks
 */

import React from 'react';

export interface SkipLink {
  href: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { href: '#main-content', label: 'Pular para conteúdo principal' },
  { href: '#sidebar-nav', label: 'Pular para navegação' },
  { href: '#footer', label: 'Pular para rodapé' },
];

export function SkipLinks({ links = DEFAULT_SKIP_LINKS }: SkipLinksProps) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="sr-only sr-only-focusable fixed top-0 left-0 z-50 inline-block px-4 py-2 bg-[#0054A6] text-white font-bold rounded-none focus:outline-none focus:ring-2 focus:ring-offset-0"
        >
          {link.label}
        </a>
      ))}
    </>
  );
}
