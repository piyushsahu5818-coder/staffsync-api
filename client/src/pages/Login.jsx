import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { errMsg } from "../api/axios";
import { Msg } from "../components/ui";

export default function Login() {
  const { user, login } = useAuth();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "employee", department: "", code: "" });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "register") await api.post("/auth/register", f);
      await login(f.email, f.password);
    } catch (err) {
      setMsg({ type: "error", text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-art">
        <div className="brand px-0">Staff<span>Sync</span></div>
        <h1>Leave, attendance and people in one place.</h1>
        <p>HR manages records and announcements, managers approve leave and run training, employees handle their own day.</p>
      </div>
      <div className="login-form">
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 380 }}>
          <h2 className="mb-3 fw-bold">{mode === "login" ? "Log in" : "Create your account"}</h2>
          <Msg msg={msg} />
          {mode === "register" && (
            <>
              <label className="form-label">Full name</label>
              <input className="form-control mb-3" value={f.name} onChange={set("name")} required />
            </>
          )}
          <label className="form-label">Email</label>
          <input type="email" className="form-control mb-3" value={f.email} onChange={set("email")} required />
          <label className="form-label">Password</label>
          <input type="password" className="form-control mb-3" value={f.password} onChange={set("password")} minLength={6} required />
          {mode === "register" && (
            <>
              <label className="form-label">Role</label>
              <select className="form-select mb-3" value={f.role} onChange={set("role")}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
              <label className="form-label">Department</label>
              <input className="form-control mb-3" value={f.department} onChange={set("department")} placeholder="e.g. Engineering" />
              {f.role !== "employee" && (
                <>
                  <label className="form-label">Registration code <span className="text-muted">(if your organisation set one)</span></label>
                  <input className="form-control mb-3" value={f.code} onChange={set("code")} />
                </>
              )}
            </>
          )}
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
          <p className="mt-3 text-center">
            {mode === "login" ? "New here? " : "Already registered? "}
            <a href="#" onClick={(e) => { e.preventDefault(); setMsg(null); setMode(mode === "login" ? "register" : "login"); }}>
              {mode === "login" ? "Create an account" : "Log in"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
