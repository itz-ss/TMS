const StatusDots = ({ data }) => {
  if (!data) return null;

  return (
    <div className="status-dots">
      {(data.approvedOnTime || data.approvedLate) && (
        <span
          className={`dot ${data.approvedLate ? "orange" : "green"}`}
        />
      )}

      {data.notSubmitted && <span className="dot red" />}
    </div>
  );
};

export default StatusDots;
