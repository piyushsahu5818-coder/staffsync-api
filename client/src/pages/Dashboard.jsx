import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { fmtDate, fmtTime } from "../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const [att, setAtt] = useState(null);
  const [news, setNews] = useState([]);
  const [pending, setPending] = useState(0);
  const canReview = user.role !== "employee";

  useEffect(() => {
    api.get("/attendance/mine").then((r) => setAtt(r.data.today));
    api.get("/announcements").then((r) => setNews(r.data.slice(0, 3)));
    if (canReview) api.get("/leaves/team?status=pending").then((r) => setPending(r.data.length));
  }, [canReview]);

  return (
    <>
      <h1 className="page-title">Hello, {user.name.split(" ")[0]}</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="panel h-100">
            <div className="stat">{user.leaveBalance}</div>
            <div className="stat-label">leave days remaining</div>
            <Link to="/leaves" className="d-inline-block mt-3">Apply for leave</Link>
          </div>
        </div>
        <div className="col-md-4">
          <div className="panel h-100">
            <div className="stat">{att ? fmtTime(att.checkIn) : "—"}</div>
            <div className="stat-label">{att ? (att.checkOut ? `checked out at ${fmtTime(att.checkOut)}` : "checked in today") : "not checked in today"}</div>
            <Link to="/attendance" className="d-inline-block mt-3">{att ? "View attendance" : "Check in"}</Link>
          </div>
        </div>
        {canReview && (
          <div className="col-md-4">
            <div className="panel h-100">
              <div className="stat">{pending}</div>
              <div className="stat-label">leave requests waiting for review</div>
              <Link to="/leaves" className="d-inline-block mt-3">Review requests</Link>
            </div>
          </div>
        )}
      </div>
      <div className="panel">
        <h2>Latest announcements</h2>
        {news.length === 0 && <div className="empty">No announcements yet.</div>}
        {news.map((n) => (
          <div key={n._id} className="mb-3">
            <div className="fw-semibold">{n.title}</div>
            <div className="text-muted small">{n.postedBy?.name} · {fmtDate(n.createdAt)}</div>
            <div>{n.body}</div>
          </div>
        ))}
      </div>
    </>
  );
}
