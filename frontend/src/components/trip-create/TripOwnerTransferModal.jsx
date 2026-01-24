// Confirmation modal for owner transfer or member removal.
const TripOwnerTransferModal = ({
  memberName,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel,
  cancelLabel,
}) => {
  return (
    <div className="trip-modal-layer" role="dialog" aria-modal="true">
      <div className="trip-modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="trip-modal-actions">
          <button className="trip-modal-confirm" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="trip-modal-cancel" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripOwnerTransferModal;
