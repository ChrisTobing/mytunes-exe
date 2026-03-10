import "./ConfirmModal.css";

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="window modal-window">
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onCancel} />
          </div>
        </div>
        <div className="window-body modal-body">
          <div className="modal-content-row">
            <span className="modal-icon">⚠</span>
            <p className="modal-message">{message}</p>
          </div>
          <div className="modal-actions">
            <button onClick={onConfirm}>OK</button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
