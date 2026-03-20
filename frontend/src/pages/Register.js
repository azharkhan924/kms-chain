import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, User, Link2, ArrowRight, Upload, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { register } from "../api/services";

export default function Register() {
  const [form, setForm]     = useState({ fullName:"", email:"", password:"", confirm:"", role:"USER" });
  const [loading, setLoading] = useState(false);
  const { loginUser }       = useAuth();
  const navigate            = useNavigate();
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) return toast.error("All fields required");
    if (form.password !== form.confirm)  return toast.error("Passwords do not match");
    if (form.password.length < 6)        return toast.error("Password must be 6+ characters");
    setLoading(true);
    try {
      const { data } = await register({ fullName:form.fullName, email:form.email, password:form.password, role:form.role });
      if (data.success) {
        loginUser(data.data, data.data.token);
        toast.success("Account created");
        const r = data.data.role;
        navigate(r === "ADMIN" ? "/admin" : r === "VERIFIER" ? "/verifier" : "/dashboard");
      }
    } catch (err) { toast.error(err.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div style={{ position:"fixed", top:16, right:16 }}><ThemeToggle /></div>
      <div className="auth-card anim-scale" style={{ maxWidth:420 }}>
        <div className="auth-card-head">
          <div className="auth-logo-row">
            <div className="auth-logo-icon"><Link2 size={15} /></div>
            <div>
              <div className="auth-logo-name">KMS Chain</div>
              <div style={{ fontSize:10, color:"var(--text-4)" }}>Blockchain Verification</div>
            </div>
          </div>
          <div className="auth-heading">Create account</div>
          <div className="auth-sub">Get started with document verification</div>
        </div>
        <div className="auth-card-body">
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <div className="input-wrap">
                <User className="input-icon" />
                <input className="form-input" type="text" name="fullName"
                  placeholder="John Doe" value={form.fullName} onChange={set} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrap">
                <Mail className="input-icon" />
                <input className="form-input" type="email" name="email"
                  placeholder="you@example.com" value={form.email} onChange={set} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-grid">
                {[
                  { v:"USER",     I:Upload,      n:"User",     d:"Upload & track documents" },
                  { v:"VERIFIER", I:ShieldCheck, n:"Verifier", d:"Verify document integrity" },
                ].map(({ v, I, n, d }) => (
                  <button type="button" key={v}
                    className={`role-card${form.role === v ? " active" : ""}`}
                    onClick={() => setForm(p => ({ ...p, role:v }))}>
                    <div className="role-card-icon"><I size={13} /></div>
                    <div className="role-card-name">{n}</div>
                    <div className="role-card-desc">{d}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <Lock className="input-icon" />
                  <input className="form-input" type="password" name="password"
                    placeholder="Min 6 chars" value={form.password} onChange={set} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <div className="input-wrap">
                  <Lock className="input-icon" />
                  <input className="form-input" type="password" name="confirm"
                    placeholder="Repeat" value={form.confirm} onChange={set} />
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} style={{ marginTop:4, justifyContent:"center" }}>
              {loading ? <><div className="spinner-sm" /> Creating…</> : <>Create account <ArrowRight size={14} /></>}
            </button>
          </form>
        </div>
        <div className="auth-card-foot">
          Have an account? <Link to="/login" className="auth-link">Sign in</Link>
          <span style={{ margin:"0 8px", color:"var(--border-2)" }}>·</span>
          <Link to="/" style={{ color:"var(--text-4)" }}>← Home</Link>
        </div>
      </div>
    </div>
  );
}
