const ErrorMessage = ({
  title = 'Couldn’t load this content',
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => (
  <div className="error-card" role="alert">
    <div className="error-card-glow" aria-hidden="true" />
    <div className="error-card-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 8v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="12" cy="16.25" r="1" fill="currentColor" />
      </svg>
    </div>
    <div className="error-card-copy">
      <p className="error-card-kicker">Connection issue</p>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  </div>
);

export default ErrorMessage;
