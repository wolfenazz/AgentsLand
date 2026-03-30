import React, { memo, useMemo, useState, useCallback } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { convertFileSrc } from '@tauri-apps/api/core';

interface MarkdownPreviewProps {
  content: string;
  theme: 'dark' | 'light';
  filePath?: string;
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+$/, '');
}

function processImagePaths(content: string, filePath: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const markdownDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/') + 1);
  
  let processed = content;
  
  processed = processed.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt, src) => {
      if (src.startsWith('http://') || src.startsWith('https://')) {
        return `![${alt}](${src})`;
      }
      if (src.startsWith('file://') || src.startsWith('asset://')) {
        return `![${alt}](${src})`;
      }
      if (src.startsWith('/')) {
        return `![${alt}](${convertFileSrc(src)})`;
      }
      const absolutePath = (markdownDir + src).replace(/\\/g, '/');
      return `![${alt}](${convertFileSrc(absolutePath)})`;
    }
  );
  
  processed = processed.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi,
    (_match, before, src, after) => {
      let convertedSrc = src;
      if (src.startsWith('http://') || src.startsWith('https://')) {
        convertedSrc = src;
      } else if (src.startsWith('file://') || src.startsWith('asset://')) {
        convertedSrc = src;
      } else if (src.startsWith('/')) {
        convertedSrc = convertFileSrc(src);
      } else {
        const absolutePath = (markdownDir + src).replace(/\\/g, '/');
        convertedSrc = convertFileSrc(absolutePath);
      }
      return `<img ${before}src="${convertedSrc}"${after}>`;
    }
  );
  
  return processed;
}

function processAutoLinks(content: string): string {
  const urlRegex = /(?<!\()(?<!\[])(https?:\/\/[^\s\)]+)(?!\))/g;
  return content.replace(urlRegex, '[$1]($1)');
}

const styledRenderer: any = {
  heading({ tokens, text }: { tokens: any[]; text: string }) {
    const id = generateId(text);
    const level = tokens.length;
    return `<h${level} id="${id}">${text}</h${level}>`;
  },
  link({ href, title, text }: { href: string; title?: string | null; text: string }) {
    const titleAttr = title ? ` title="${title}"` : '';
    const targetAttr = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
  },
  blockquote({ tokens }: { tokens: any[] }) {
    if (tokens.length === 0) return '<blockquote></blockquote>';
    const text = tokens.map(t => t.text || t.raw).join('\n');
    const firstLine = text.split('\n')[0].toLowerCase();
    let classes = 'md-blockquote';
    if (firstLine.includes('warning') || firstLine.includes('⚠')) classes += ' md-blockquote-warning';
    else if (firstLine.includes('info') || firstLine.includes('ℹ')) classes += ' md-blockquote-info';
    else if (firstLine.includes('error') || firstLine.includes('✗')) classes += ' md-blockquote-error';
    else if (firstLine.includes('check') || firstLine.includes('✓') || firstLine.includes('tip')) classes += ' md-blockquote-tip';
    return `<blockquote class="${classes}">${text}</blockquote>`;
  },
  table({ header, rows }: { header: any[]; rows: any[][] }) {
    const headerHtml = header.map(cell => `<th>${cell.text}</th>`).join('');
    const rowsHtml = rows.map(row => 
      `<tr>${row.map(cell => `<td>${cell.text}</td>`).join('')}</tr>`
    ).join('');
    return `<div class="md-table-wrapper"><table class="md-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
  },
  list({ items, task }: { items: any[]; task?: boolean }) {
    if (task) {
      const html = items.map(item => {
        const checkbox = item.task ? 
          `<input type="checkbox" class="md-checkbox" ${item.checked ? 'checked' : ''} disabled />` : '';
        return `<li class="md-task-item">${checkbox}${item.text}</li>`;
      }).join('');
      return `<ul class="md-task-list">${html}</ul>`;
    }
    return null;
  },
  code({ text, lang }: { text: string; lang?: string }) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
    const highlighted = hljs.highlight(text, { language }).value;
    return `<div class="md-code-wrapper"><pre class="md-code-block"><code class="hljs language-${language}">${highlighted}</code></pre><button class="md-copy-btn" data-code="${encodeURIComponent(text)}">Copy</button></div>`;
  },
};

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(text: string, lang: string) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(text, { language }).value;
    }
  })
);

marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderer = {
  ...styledRenderer,
};

marked.use({ renderer });

function extractTableOfContents(content: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      entries.push({
        id: generateId(match[2]),
        text: match[2],
        level: match[1].length,
      });
    }
  }
  
  return entries;
}

const MarkdownPreviewInner: React.FC<MarkdownPreviewProps> = ({ content, theme, filePath }) => {
  const [showToc, setShowToc] = useState(false);
  
  const toc = useMemo(() => extractTableOfContents(content), [content]);
  
  const html = useMemo(() => {
    let processedContent = content;
    if (filePath) {
      processedContent = processImagePaths(processedContent, filePath);
    }
    processedContent = processAutoLinks(processedContent);
    
    try {
      return marked.parse(processedContent) as string;
    } catch (e) {
      console.error('Markdown parse error:', e);
      return '<p>Failed to render markdown</p>';
    }
  }, [content, filePath]);

  const handleCopyCode = useCallback((e: MouseEvent) => {
    const btn = e.target as HTMLButtonElement;
    const codeData = btn.dataset.code;
    if (codeData) {
      const code = decodeURIComponent(codeData);
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 2000);
      });
    }
  }, []);

  return (
    <div className={`markdown-preview absolute inset-0 overflow-y-auto overflow-x-hidden ${theme === 'light' ? 'markdown-light' : 'markdown-dark'}`}>
      {toc.length > 2 && (
        <button 
          onClick={() => setShowToc(!showToc)}
          className={`fixed top-4 right-4 z-50 px-3 py-1.5 rounded text-xs uppercase tracking-widest transition-colors ${
            theme === 'light' 
              ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700' 
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
          }`}
        >
          TOC
        </button>
      )}
      {showToc && toc.length > 0 && (
        <div className={`fixed top-14 right-4 z-50 p-4 rounded-lg shadow-xl max-h-60 overflow-y-auto ${
          theme === 'light' ? 'bg-white border border-zinc-200' : 'bg-zinc-900 border border-zinc-700'
        }`}>
          <div className={`text-xs uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Table of Contents
          </div>
          {toc.map((entry, idx) => (
            <a 
              key={idx}
              href={`#${entry.id}`}
              className={`block text-xs py-1 hover:underline ${
                theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'
              }`}
              style={{ paddingLeft: `${(entry.level - 1) * 12}px` }}
            >
              {entry.text}
            </a>
          ))}
        </div>
      )}
      <div 
        className="markdown-content p-6"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={(e) => {
          const btn = e.target as HTMLElement;
          if (btn.classList.contains('md-copy-btn')) {
            handleCopyCode(e as unknown as MouseEvent);
          }
        }}
      />
    </div>
  );
};

export const MarkdownPreview = memo(MarkdownPreviewInner);