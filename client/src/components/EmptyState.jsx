const EmptyState = ({ title = 'Nothing here yet', message }) => (
  <div className="empty-state panel">
    <h3>{title}</h3>
    {message ? <p className="muted">{message}</p> : null}
  </div>
);

export default EmptyState;
