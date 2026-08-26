import { useState } from 'react';
import MarkdownPreview from './MarkdownPreview';

const MarkdownEditor = ({
  title,
  coverImage,
  tags,
  content,
  saving,
  onChange,
  onSaveDraft,
  onPublish,
}) => {
  const [tagValue, setTagValue] = useState('');

  const addTag = (name) => {
    const next = name.trim().toLowerCase();
    if (!next || tags.includes(next) || tags.length >= 8) {
      setTagValue('');
      return;
    }
    onChange({ tags: [...tags, next] });
    setTagValue('');
  };

  return (
    <div className="editor-page">
      <div className="editor-toolbar">
        <p className="muted">Markdown on the left. Live preview on the right.</p>
        <div className="meta-row">
          <button type="button" className="btn secondary" disabled={saving} onClick={onSaveDraft}>
            Save draft
          </button>
          <button type="button" className="btn" disabled={saving} onClick={onPublish}>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <input
        className="editor-title"
        value={title}
        onChange={(event) => onChange({ title: event.target.value })}
        placeholder="Article title"
      />

      <div className="form-field">
        <label htmlFor="cover">Cover image URL</label>
        <input
          id="cover"
          value={coverImage}
          onChange={(event) => onChange({ coverImage: event.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="form-field">
        <label htmlFor="tags">Tags</label>
        <div className="tag-input-row">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className="tag-pill"
              onClick={() => onChange({ tags: tags.filter((item) => item !== tag) })}
              title="Remove tag"
            >
              #{tag} ×
            </button>
          ))}
          <input
            id="tags"
            value={tagValue}
            placeholder="javascript, then Enter"
            onChange={(event) => setTagValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addTag(tagValue.replace(',', ''));
              }
            }}
          />
        </div>
        <div className="tag-row">
          {['javascript', 'react', 'nodejs', 'mongodb', 'express'].map((suggestion) => (
            <button key={suggestion} type="button" className="tag-pill" onClick={() => addTag(suggestion)}>
              #{suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-grid">
        <textarea
          className="editor-body"
          value={content}
          onChange={(event) => onChange({ content: event.target.value })}
          placeholder={'# Heading\n\nWrite in Markdown. Fenced code:\n\n```js\nconst hello = "Hello World";\nconsole.log(hello);\n```'}
        />
        <div className="preview-pane">
          <MarkdownPreview content={content} />
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
