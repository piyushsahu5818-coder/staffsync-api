import { useEffect, useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, fmtDate } from "../components/ui";

export default function Announcements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [f, setF] = useState({ title: "", body: "" });
  const [msg, setMsg] = useState(null);
  const load = () => api.get("/announcements").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    try { await api.post("/announcements", f); setF({ title: "", body: "" }); load(); setMsg({ type: "ok", text: "Announcement posted" }); }
    catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try { await api.delete(`/announcements/${id}`); load(); } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <>
      <h1 className="page-title">Announcements</h1>
      <Msg msg={msg} />
      {user.role === "hr" && (
        <form className="panel mb-3" onSubmit={post}>
          <h2>Post an announcement</h2>
          <input className="form-control mb-2" placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
          <textarea className="form-control mb-2" rows={3} placeholder="What should everyone know?" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} required />
          <button className="btn btn-primary">Post announcement</button>
        </form>
      )}
      {list.map((a) => (
        <div key={a._id} className="panel mb-3">
          <div className="d-flex justify-content-between">
            <div className="fw-semibold fs-5">{a.title}</div>
            {user.role === "hr" && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(a._id)}>Delete</button>}
          </div>
          <div className="text-muted small mb-2">{a.postedBy?.name} · {fmtDate(a.createdAt)}</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{a.body}</div>
        </div>
      ))}
      {list.length === 0 && <div className="panel empty">No announcements yet.</div>}
    </>
  );
}
