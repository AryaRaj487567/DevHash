const ConfirmDeleteModal = ({ open, title, message, onCancel, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal stack">
        <h2 className="page-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="meta-row">
          <button type="button" className="btn secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button type="button" className="btn danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
