import { useEffect, useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, fmtDate, dateInput } from "../components/ui";

const blank = { name: "", email: "", password: "", role: "employee", department: "", designation: "", managerId: "", phone: "", joiningDate: "", leaveBalance: 20 };

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === "hr";
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // null = hidden
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => api.get("/employees", { params: { q } }).then((r) => setList(r.data));
  useEffect(() => { load(); }, [q]);
  const managers = list.filter((u) => u.role === "manager");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => { setEditId(null); setForm(blank); setMsg(null); };
  const openEdit = (u) => {
    setEditId(u._id);
    setForm({ ...blank, ...u, password: "", managerId: u.managerId?._id || "", joiningDate: dateInput(u.joiningDate) });
    setMsg(null);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form };
      if (editId && !body.password) delete body.password;
      if (editId) await api.put(`/employees/${editId}`, body);
      else await api.post("/employees", body);
      setForm(null);
      setMsg({ type: "ok", text: editId ? "Employee updated" : "Employee added" });
      load();
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try { await api.delete(`/employees/${u._id}`); setMsg({ type: "ok", text: "Employee deleted" }); load(); }
    catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="page-title mb-0">{isHR ? "Employees" : "My team"}</h1>
        <div className="d-flex gap-2">
          <input className="form-control" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
          {isHR && <button className="btn btn-primary text-nowrap" onClick={openNew}>Add employee</button>}
        </div>
      </div>
      <Msg msg={msg} />

      {form && (
        <form className="panel mb-3" onSubmit={save}>
          <h2>{editId ? "Edit employee" : "New employee"}</h2>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={set("name")} required /></div>
            <div className="col-md-4"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={set("email")} required /></div>
            <div className="col-md-4"><label className="form-label">{editId ? "New password (optional)" : "Password"}</label><input type="password" className="form-control" value={form.password} onChange={set("password")} minLength={6} required={!editId} /></div>
            <div className="col-md-3"><label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={set("role")}><option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option></select></div>
            <div className="col-md-3"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={set("department")} /></div>
            <div className="col-md-3"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={set("designation")} /></div>
            <div className="col-md-3"><label className="form-label">Reports to</label>
              <select className="form-select" value={form.managerId} onChange={set("managerId")}><option value="">No manager</option>{managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}</select></div>
            <div className="col-md-4"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={set("phone")} /></div>
            <div className="col-md-4"><label className="form-label">Joining date</label><input type="date" className="form-control" value={form.joiningDate} onChange={set("joiningDate")} /></div>
            <div className="col-md-4"><label className="form-label">Leave days</label><input type="number" min="0" className="form-control" value={form.leaveBalance} onChange={set("leaveBalance")} /></div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary">Save employee</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="panel table-responsive">
        <table className="table align-middle mb-0">
          <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Reports to</th><th>Joined</th><th>Leave left</th>{isHR && <th></th>}</tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id}>
                <td><div className="fw-semibold">{u.name}</div><div className="small text-muted">{u.email}</div></td>
                <td className="text-capitalize">{u.role}</td>
                <td>{u.department}</td>
                <td>{u.managerId?.name || "—"}</td>
                <td>{fmtDate(u.joiningDate)}</td>
                <td>{u.leaveBalance}</td>
                {isHR && <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openEdit(u)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Delete</button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="empty">{isHR ? "No employees match your search." : "No one reports to you yet. Ask HR to assign team members."}</div>}
      </div>
    </>
  );
}
