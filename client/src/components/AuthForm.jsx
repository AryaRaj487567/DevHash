import { Link } from 'react-router-dom';

const AuthForm = ({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  error,
  loading,
  fields,
  values,
  onChange,
  footer,
}) => (
  <div className="auth-wrap">
    <form
      className="auth-card stack"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {error ? <div className="error-banner">{error}</div> : null}
      {fields.map((field) => (
        <div className="form-field" key={field.name}>
          <label htmlFor={field.name}>{field.label}</label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={(event) => onChange(field.name, event.target.value)}
            required={field.required}
          />
        </div>
      ))}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? 'Please wait...' : submitLabel}
      </button>
      {footer ? (
        <p className="muted">
          {footer.text} <Link to={footer.to}>{footer.linkLabel}</Link>
        </p>
      ) : null}
    </form>
  </div>
);

export default AuthForm;
