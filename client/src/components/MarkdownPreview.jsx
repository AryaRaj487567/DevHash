import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';

const MarkdownPreview = ({ content }) => (
  <div className="markdown">
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');

          if (match) {
            return (
              <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                {code}
              </SyntaxHighlighter>
            );
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content || '_Nothing to preview yet._'}
    </ReactMarkdown>
  </div>
);

export default MarkdownPreview;
