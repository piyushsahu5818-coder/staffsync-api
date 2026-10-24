import { useEffect, useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, StatusBadge, fmtDate, fmtTime } from "../components/ui";

export default function Attendance() {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [records, setRecords] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState(null);

  const load = () => api.get("/attendance/mine").then((r) => { setToday(r.data.today); setRecords(r.data.records); });
  const loadAll = () => user.role === "hr" && api.get("/attendance", { params: { date } }).then((r) => setAll(r.data));
  useEffect(() => { load(); }, []);
  useEffect(() => { loadAll(); }, [date]);

  const act = async (path, text) => {
    try { await api.post(`/attendance/${path}`); setMsg({ type: "ok", text }); load(); loadAll(); }
    catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <>
      <h1 className="page-title">Attendance</h1>
      <Msg msg={msg} />
      <div className="panel mb-3 d-flex flex-wrap align-items-center gap-3">
        <div className="flex-grow-1">
          <div className="fw-semibold">{fmtDate(new Date())}</div>
          <div className="text-muted">{!today ? "You haven't checked in yet." : today.checkOut ? `Checked in ${fmtTime(today.checkIn)}, out ${fmtTime(today.checkOut)}.` : `Checked in at ${fmtTime(today.checkIn)}.`}</div>
        </div>
        <button className="btn btn-primary" disabled={!!today} onClick={() => act("check-in", "Checked in")}>Check in</button>
        <button className="btn btn-outline-primary" disabled={!today || !!today?.checkOut} onClick={() => act("check-out", "Checked out")}>Check out</button>
      </div>

      <div className="panel table-responsive mb-3">
        <h2>My records</h2>
        <table className="table mb-0">
          <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
          <tbody>{records.map((r) => <tr key={r._id}><td>{fmtDate(r.date)}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td><td><StatusBadge status={r.status} /></td></tr>)}</tbody>
        </table>
        {records.length === 0 && <div className="empty">No attendance recorded yet.</div>}
      </div>

      {user.role === "hr" && (
        <div className="panel table-responsive">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="mb-0">Everyone's attendance</h2>
            <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <table className="table mb-0">
            <thead><tr><th>Employee</th><th>Department</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
            <tbody>{all.map((r) => <tr key={r._id}><td>{r.employeeId?.name}</td><td>{r.employeeId?.department}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td><td><StatusBadge status={r.status} /></td></tr>)}</tbody>
          </table>
          {all.length === 0 && <div className="empty">No one checked in on this date.</div>}
        </div>
      )}
    </>
  );
}
