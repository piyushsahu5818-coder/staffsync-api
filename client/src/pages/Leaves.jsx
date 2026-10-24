import { useEffect, useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, StatusBadge, fmtDate } from "../components/ui";

export default function Leaves() {
  const { user, refresh } = useAuth();
  const canReview = user.role !== "employee";
  const [tab, setTab] = useState("mine");
  const [mine, setMine] = useState([]);
  const [team, setTeam] = useState([]);
  const [f, setF] = useState({ type: "casual", fromDate: "", toDate: "", reason: "" });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const load = () => {
    api.get("/leaves/mine").then((r) => setMine(r.data));
    if (canReview) api.get("/leaves/team").then((r) => setTeam(r.data));
  };
  useEffect(load, []);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leaves", f);
      setF({ type: "casual", fromDate: "", toDate: "", reason: "" });
      setMsg({ type: "ok", text: "Leave request sent" });
      load();
    } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };
  const cancel = async (id) => {
    try { await api.delete(`/leaves/${id}`); load(); } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };
  const review = async (id, status) => {
    try { await api.patch(`/leaves/${id}/status`, { status }); setMsg({ type: "ok", text: `Request ${status}` }); load(); refresh(); }
    catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <>
      <h1 className="page-title">Leaves</h1>
      <Msg msg={msg} />
      {canReview && (
        <ul className="nav nav-pills mb-3 gap-1">
          <li className="nav-item"><button className={`nav-link ${tab === "mine" ? "active" : ""}`} onClick={() => setTab("mine")}>My leaves</button></li>
          <li className="nav-item"><button className={`nav-link ${tab === "team" ? "active" : ""}`} onClick={() => setTab("team")}>Team requests</button></li>
        </ul>
      )}

      {tab === "mine" && (
        <>
          <form className="panel mb-3" onSubmit={apply}>
            <h2>Apply for leave <span className="text-muted fw-normal fs-6">({user.leaveBalance} days left)</span></h2>
            <div className="row g-3">
              <div className="col-md-3"><label className="form-label">Type</label>
                <select className="form-select" value={f.type} onChange={set("type")}><option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option><option value="unpaid">Unpaid</option></select></div>
              <div className="col-md-3"><label className="form-label">From</label><input type="date" className="form-control" value={f.fromDate} onChange={set("fromDate")} required /></div>
              <div className="col-md-3"><label className="form-label">To</label><input type="date" className="form-control" value={f.toDate} min={f.fromDate} onChange={set("toDate")} required /></div>
              <div className="col-md-12"><label className="form-label">Reason</label><input className="form-control" value={f.reason} onChange={set("reason")} required /></div>
            </div>
            <button className="btn btn-primary mt-3">Send request</button>
          </form>
          <div className="panel table-responsive">
            <table className="table mb-0 align-middle">
              <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>{mine.map((l) => (
                <tr key={l._id}>
                  <td className="text-capitalize">{l.type}</td>
                  <td>{fmtDate(l.fromDate)} – {fmtDate(l.toDate)}</td>
                  <td>{l.days}</td><td>{l.reason}</td>
                  <td><StatusBadge status={l.status} /></td>
                  <td className="text-end">{l.status === "pending" && <button className="btn btn-sm btn-outline-secondary" onClick={() => cancel(l._id)}>Cancel</button>}</td>
                </tr>))}
              </tbody>
            </table>
            {mine.length === 0 && <div className="empty">You haven't requested any leave yet.</div>}
          </div>
        </>
      )}

      {tab === "team" && (
        <div className="panel table-responsive">
          <table className="table mb-0 align-middle">
            <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
            <tbody>{team.map((l) => (
              <tr key={l._id}>
                <td><div className="fw-semibold">{l.employeeId?.name}</div><div className="small text-muted">{l.employeeId?.department}</div></td>
                <td className="text-capitalize">{l.type}</td>
                <td>{fmtDate(l.fromDate)} – {fmtDate(l.toDate)}</td>
                <td>{l.days}</td><td>{l.reason}</td>
                <td><StatusBadge status={l.status} /></td>
                <td className="text-end text-nowrap">{l.status === "pending" && l.employeeId?._id !== user._id && (
                  <>
                    <button className="btn btn-sm btn-success me-2" onClick={() => review(l._id, "approved")}>Approve</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => review(l._id, "rejected")}>Reject</button>
                  </>)}</td>
              </tr>))}
            </tbody>
          </table>
          {team.length === 0 && <div className="empty">No leave requests from your team.</div>}
        </div>
      )}
    </>
  );
}
