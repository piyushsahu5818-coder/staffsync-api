export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—");
export const dateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const colors = { pending: "warning", approved: "success", rejected: "danger", present: "success", late: "warning", "half-day": "secondary" };
export const StatusBadge = ({ status }) => (
  <span className={`badge badge-status text-bg-${colors[status] || "secondary"}`}>{status}</span>
);

export const Msg = ({ msg }) =>
  msg ? <div className={`alert alert-${msg.type === "error" ? "danger" : "success"} py-2`} role="alert">{msg.text}</div> : null;
