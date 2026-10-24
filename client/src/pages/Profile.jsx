import { useState } from "react";
import api, { errMsg } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Msg, fmtDate } from "../components/ui";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [f, setF] = useState({ name: user.name, phone: user.phone || "", address: user.address || "", password: "" });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...f };
      if (!body.password) delete body.password;
      await api.put(`/employees/${user._id}`, body);
      await refresh();
      setF({ ...f, password: "" });
      setMsg({ type: "ok", text: "Profile saved" });
    } catch (err) { setMsg({ type: "error", text: errMsg(err) }); }
  };

  return (
    <>
      <h1 className="page-title">My profile</h1>
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="panel">
            <h2>Work details</h2>
            <dl className="mb-0">
              <dt>Email</dt><dd>{user.email}</dd>
              <dt>Role</dt><dd className="text-capitalize">{user.role}</dd>
              <dt>Department</dt><dd>{user.department}</dd>
              <dt>Designation</dt><dd>{user.designation || "—"}</dd>
              <dt>Joined</dt><dd>{fmtDate(user.joiningDate)}</dd>
              <dt>Leave days left</dt><dd className="mb-0">{user.leaveBalance}</dd>
            </dl>
          </div>
        </div>
        <div className="col-lg-8">
          <form className="panel" onSubmit={save}>
            <h2>Personal details</h2>
            <Msg msg={msg} />
            <label className="form-label">Name</label><input className="form-control mb-3" value={f.name} onChange={set("name")} required />
            <label className="form-label">Phone</label><input className="form-control mb-3" value={f.phone} onChange={set("phone")} />
            <label className="form-label">Address</label><textarea className="form-control mb-3" rows={2} value={f.address} onChange={set("address")} />
            <label className="form-label">New password <span className="text-muted">(leave blank to keep the current one)</span></label>
            <input type="password" className="form-control mb-3" minLength={6} value={f.password} onChange={set("password")} />
            <button className="btn btn-primary">Save changes</button>
          </form>
        </div>
      </div>
    </>
  );
}
