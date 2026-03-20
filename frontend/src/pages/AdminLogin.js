import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { login } from "../api/services";

export default function AdminLogin() {
  const [form, setForm]     = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const { loginUser }       = useAuth();
  const navigate            = useNavigate();
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error("Enter your credentials");
    setLoading(true);
    try {
      const { data } = await login(form);
      if (data.success) {
        if (data.data.role !== "ADMIN") {
          toast.error("Access denied — this portal is for administrators only");
          setLoading(false);
          return;
        }
        loginUser(data.data, data.data.token);
        toast.success(`Welcome, ${data.data.fullName}`);
        navigate("/admin");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap" style={{ background:"var(--bg)" }}>
      <div style={{ position:"fixed", top:16, right:16 }}><ThemeToggle /></div>
      <div className="auth-card anim-scale" style={{ maxWidth:380 }}>
        {/* Header band */}
        <div style={{ height:4, background:"var(--danger)", borderRadius:"var(--radius-xl) var(--radius-xl) 0 0" }} />
        <div className="auth-card-head">
          <div className="auth-logo-row">
            <div className="auth-logo-icon" style={{ background:"var(--danger)", color:"#fff" }}><Shield size={15} /></div>
            <div>
              <div className="auth-logo-name">Admin Portal</div>
              <div style={{ fontSize:10, color:"var(--text-4)" }}>KMS Chain · Restricted access</div>
            </div>
          </div>
          <div className="auth-heading">Administrator sign in</div>
          <div className="auth-sub">This portal is restricted to system administrators only.</div>
        </div>

        <div className="auth-card-body">
          {/* Warning strip */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"9px 12px", background:"var(--danger-bg)", border:"1px solid var(--danger-border)", borderRadius:"var(--radius-sm)", marginBottom:16, fontSize:12, color:"var(--danger)" }}>
            <Shield size={13} style={{ flexShrink:0, marginTop:1 }} />
            <span>Only authorized administrators may proceed. All access attempts are logged.</span>
          </div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Admin email</label>
              <div className="input-wrap">
                <Mail className="input-icon" />
                <input className="form-input" type="email" name="email"
                  placeholder="admin@organization.com" value={form.email} onChange={set} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" />
                <input className="form-input" type="password" name="password"
                  placeholder="Administrator password" value={form.password} onChange={set} />
              </div>
            </div>
            <button className="btn btn-block btn-lg" type="submit" disabled={loading}
              style={{ justifyContent:"center", marginTop:6, background:"var(--danger)", color:"#fff", border:"1px solid var(--danger)" }}>
              {loading ? <><div className="spinner-sm" /> Authenticating…</> : <><Shield size={14} /> Sign in as Admin <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>

        <div className="auth-card-foot">
          Not an admin? <Link to="/login" className="auth-link">Regular sign in</Link>
          <span style={{ margin:"0 8px", color:"var(--border-2)" }}>·</span>
          <Link to="/" style={{ color:"var(--text-4)" }}>← Home</Link>
        </div>
      </div>
    </div>
  );
}
