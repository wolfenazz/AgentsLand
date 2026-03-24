import React, { useEffect, useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { minimizeWindow, maximizeWindow, closeWindow } from '../../utils/window';
import docsContent from '../../assets/docs/userguid.md?raw';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocsScreenProps {
  isWindows: boolean;
  onBack: () => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const DocsScreen: React.FC<DocsScreenProps> = ({
  isWindows,
  onBack,
  theme,
  onThemeToggle,
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tocItems = useMemo<TocItem[]>(() => {
    const lines = docsContent.split('\n');
    const items: TocItem[] = [];
    
    lines.forEach((line: string) => {
      const h2Match = line.match(/^## (.+)$/);
      const h3Match = line.match(/^### (.+)$/);
      
      if (h2Match) {
        const text = h2Match[1];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        items.push({ id, text, level: 2 });
      } else if (h3Match) {
        const text = h3Match[1];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        items.push({ id, text, level: 3 });
      }
    });
    
    return items;
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading.element) {
          const rect = heading.element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(heading.id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  return (
    <div className={`h-screen bg-theme-main text-theme-main font-mono flex flex-col overflow-hidden ${theme === 'light' ? 'light-theme' : ''}`}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center h-10 bg-theme-main border-b border-theme select-none transition-colors ${isWindows ? 'titlebar-drag active:cursor-grabbing' : ''}`}
      >
        <div className="flex items-center h-full titlebar-nodrag">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-full border-l border-theme hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main"
            title="Back"
          >
            <ArrowLeftIcon />
          </button>
          
          <div className="flex items-center gap-2 px-3 h-full border-r border-theme bg-theme-card cursor-default">
            <BookIcon />
            <span className="text-xs font-bold text-theme-main tracking-wider uppercase">
              Documentation
            </span>
          </div>
        </div>

        <div className="flex-1 h-full" />

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-10 h-full border-l border-theme hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main md:hidden titlebar-nodrag"
          title="Toggle Sidebar"
        >
          {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div className="flex items-center h-full gap-0 titlebar-nodrag">
          <button
            onClick={onThemeToggle}
            className="flex items-center justify-center w-10 h-full border-l border-theme hover:bg-theme-hover transition-colors text-theme-secondary hover:text-theme-main"
            title="Switch Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h1M3 9h1m12.728-4.272l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {isWindows && (
            <div className="flex h-full border-l border-theme">
              <button
                onClick={minimizeWindow}
                className="w-10 h-full flex items-center justify-center hover:bg-theme-hover text-zinc-500 hover:text-zinc-200 transition-colors"
                title="Minimize"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12"><rect fill="currentColor" width="10" height="1" x="1" y="6" /></svg>
              </button>
              <button
                onClick={maximizeWindow}
                className="w-10 h-full flex items-center justify-center hover:bg-theme-hover text-zinc-500 hover:text-zinc-200 transition-colors"
                title="Maximize"
              >
                <svg className="w-3 h-3" viewBox="0 0 12 12"><rect fill="none" stroke="currentColor" width="9" height="9" x="1.5" y="1.5" strokeWidth="1" /></svg>
              </button>
              <button
                onClick={closeWindow}
                className="w-12 h-full flex items-center justify-center hover:bg-rose-600 text-zinc-500 hover:text-white transition-colors"
                title="Close"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 12 12">
                  <path fill="none" stroke="currentColor" strokeWidth="1.2" d="M1,1 L11,11 M1,11 L11,1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 pt-10 overflow-hidden">
        <aside
          className={`fixed md:relative z-40 w-64 h-[calc(100vh-2.5rem)] bg-theme-card border-r border-theme overflow-y-auto transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="p-4">
            <h2 className="text-xs font-bold text-theme-secondary uppercase tracking-wider mb-4">
              Table of Contents
            </h2>
            <ul className="space-y-1">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left py-2 px-3 rounded-sm text-sm transition-colors cursor-pointer ${
                      item.level === 3 ? 'pl-6 text-xs' : ''
                    } ${
                      activeSection === item.id
                        ? 'bg-theme-hover text-theme-main'
                        : 'text-theme-secondary hover:text-theme-main hover:bg-theme-hover/50'
                    }`}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <article className="max-w-4xl mx-auto prose prose-invert prose-sm md:prose-base">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-theme-main mb-8 pb-4 border-b border-theme">
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return (
                    <h2
                      id={id}
                      className="text-2xl font-bold text-theme-main mt-10 mb-4 pt-4 border-t border-theme/30 first:mt-0 first:border-t-0 first:pt-0"
                      {...props}
                    >
                      {children}
                    </h2>
                  );
                },
                h3: ({ children, ...props }) => {
                  const text = String(children);
                  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return (
                    <h3
                      id={id}
                      className="text-xl font-semibold text-theme-main mt-6 mb-3"
                      {...props}
                    >
                      {children}
                    </h3>
                  );
                },
                p: ({ children }) => (
                  <p className="text-theme-main leading-relaxed mb-4">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-theme-main space-y-2 mb-4 ml-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-theme-main space-y-2 mb-4 ml-4">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-theme-main">{children}</li>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code
                        className="bg-theme-card px-1.5 py-0.5 rounded text-sm text-emerald-400 font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className="block bg-theme-card p-4 rounded-sm overflow-x-auto text-sm font-mono text-theme-main border border-theme"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-theme-card p-4 rounded-sm overflow-x-auto mb-4 border border-theme">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-zinc-600 pl-4 italic text-theme-secondary my-4">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border border-theme">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-theme-card border-b border-theme">
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-xs font-semibold text-theme-main uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-theme-main border-t border-theme">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-blue-400 hover:text-blue-300 underline transition-colors cursor-pointer"
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
                hr: () => <hr className="border-theme my-8" />,
                strong: ({ children }) => (
                  <strong className="font-bold text-theme-main">{children}</strong>
                ),
              }}
            >
              {docsContent}
            </ReactMarkdown>
          </article>
        </main>
      </div>
    </div>
  );
};
