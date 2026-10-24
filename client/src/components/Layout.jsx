import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/employees", label: "Employees", roles: ["hr"] },
  { to: "/employees", label: "My team", roles: ["manager"] },
  { to: "/attendance", label: "Attendance" },
  { to: "/leaves", label: "Leaves" },
  { to: "/announcements", label: "Announcements" },
  { to: "/training", label: "Training" },
  { to: "/profile", label: "My profile" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Staff<span>Sync</span></div>
        <nav className="nav flex-column gap-1">
          {links.filter((l) => !l.roles || l.roles.includes(user.role)).map((l) => (
            <NavLink key={l.label} to={l.to} end={l.end} className="nav-link">{l.label}</NavLink>
          ))}
        </nav>
        <div className="user-box">
          <div className="fw-semibold text-white">{user.name}</div>
          <div className="text-capitalize mb-2">{user.role}</div>
          <button className="btn btn-sm btn-outline-light" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
