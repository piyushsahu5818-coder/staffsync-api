import { useEffect, useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, fmtDate } from "../components/ui";

export default function Training() {
  const { user } = useAuth();
  const canCreate = user.role !== "employee";
  const [list, setList] = useState([]);
  const [f, setF] = useState({ title: "", description: "", startDate: "", endDate: "" });
  const [msg, setMsg] = useState(null);
  const load = () => api.get("/trainings").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const run = async (fn, text) => {
    try { await fn(); if (text) setMsg({ type: "ok", text }); load(); } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };
  const create = (e) => {
    e.preventDefault();
    run(async () => { await api.post("/trainings", f); setF({ title: "", description: "", startDate: "", endDate: "" }); }, "Program created");
  };

  return (
    <>
      <h1 className="page-title">Training and development</h1>
      <Msg msg={msg} />
      {canCreate && (
        <form className="panel mb-3" onSubmit={create}>
          <h2>Create a program</h2>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Title</label><input className="form-control" value={f.title} onChange={set("title")} required /></div>
            <div className="col-md-3"><label className="form-label">Starts</label><input type="date" className="form-control" value={f.startDate} onChange={set("startDate")} required /></div>
            <div className="col-md-3"><label className="form-label">Ends</label><input type="date" className="form-control" value={f.endDate} min={f.startDate} onChange={set("endDate")} required /></div>
            <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={f.description} onChange={set("description")} /></div>
          </div>
          <button className="btn btn-primary mt-3">Create program</button>
        </form>
      )}
      <div className="row g-3">
        {list.map((t) => {
          const joined = t.participants.some((p) => p._id === user._id);
          const mayDelete = user.role === "hr" || t.createdBy?._id === user._id;
          return (
            <div className="col-lg-6" key={t._id}>
              <div className="panel h-100">
                <div className="fw-semibold fs-5">{t.title}</div>
                <div className="text-muted small mb-2">{fmtDate(t.startDate)} – {fmtDate(t.endDate)} · by {t.createdBy?.name}</div>
                <p>{t.description || "No description."}</p>
                <div className="small text-muted mb-3">{t.participants.length} enrolled{t.participants.length > 0 && canCreate ? `: ${t.participants.map((p) => p.name).join(", ")}` : ""}</div>
                <div className="d-flex gap-2">
                  {joined
                    ? <button className="btn btn-outline-secondary btn-sm" onClick={() => run(() => api.post(`/trainings/${t._id}/unenroll`), "You left the program")}>Leave program</button>
                    : <button className="btn btn-primary btn-sm" onClick={() => run(() => api.post(`/trainings/${t._id}/enroll`), "You are enrolled")}>Enroll</button>}
                  {canCreate && mayDelete && <button className="btn btn-outline-danger btn-sm" onClick={() => window.confirm("Delete this program?") && run(() => api.delete(`/trainings/${t._id}`), "Program deleted")}>Delete</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <div className="panel empty">No training programs yet.</div>}
    </>
  );
}
