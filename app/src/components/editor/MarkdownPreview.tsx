import React, { useMemo } from 'react';
import { Marked } from 'marked';
import hljs from 'highlight.js';

interface MarkdownPreviewProps {
  content: string;
  theme: 'dark' | 'light';
}

const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre class="md-code-block"><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, theme }) => {
  const html = useMemo(() => {
    try {
      return marked.parse(content) as string;
    } catch {
      return '<p>Failed to render markdown</p>';
    }
  }, [content]);

  return (
    <div className={`markdown-preview flex-1 overflow-y-auto overflow-x-hidden p-6 ${theme === 'light' ? 'markdown-light' : 'markdown-dark'}`}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
