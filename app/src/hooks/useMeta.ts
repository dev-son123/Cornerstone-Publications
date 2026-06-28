// src/hooks/useMeta.ts
// Sets page <title> and <meta name="description"> dynamically.
// Usage: useMeta({ title: 'Page Title', description: 'Page description.' });
// Automatically restores the default on unmount.

import { useEffect } from 'react';

interface MetaOptions {
  title: string;
  description: string;
}

const DEFAULT_TITLE = 'Cornerstone Research And Publication Services';
const DEFAULT_DESC  =
  'End-to-end academic publishing services — manuscript preparation, language editing, grammar proofreading, plagiarism detection, and journal submission support.';

export function useMeta({ title, description }: MetaOptions) {
  useEffect(() => {
    // Title
    const prevTitle = document.title;
    document.title = `${title} | Cornerstone Research`;

    // Meta description
    let metaEl = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const prevDesc = metaEl?.content ?? DEFAULT_DESC;
    if (metaEl) {
      metaEl.content = description;
    } else {
      metaEl = document.createElement('meta');
      metaEl.name = 'description';
      metaEl.content = description;
      document.head.appendChild(metaEl);
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      if (metaEl) metaEl.content = prevDesc;
    };
  }, [title, description]);
}
