import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Link2, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import { login } from "../api/services";

const FieldError = ({ msg }) => msg ? (
  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:12, color:"var(--danger)", fontWeight:600, animation:"fadeUp .15s ease" }}>
    <AlertCircle size={11} style={{ flexShrink:0 }} />{msg}
  </div>
) : null;

export default function Login() {
  const [form, setForm]       = useState({ email:"", password:"" });
  const [errors, setErrors]   = useState({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const { loginUser }         = useAuth();
  const navigate              = useNavigate();

  const set = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]:"" }));
    setGlobalErr("");
  };

  const validate = () => {
    const e = {};
    if (!form.email)                           e.email    = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = "Enter a valid email address";
    if (!form.password)                        e.password = "Password is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGlobalErr("");
    try {
      const { data } = await login(form);
      if (data.success) {
        loginUser(data.data, data.data.token);
        const r = data.data.role;
        navigate(r==="ADMIN" ? "/admin" : r==="VERIFIER" ? "/verifier" : "/dashboard");
      }
    } catch (err) {
      const status = err.response?.status;
      const msg    = (err.response?.data?.message || "").toLowerCase();

      if (status === 401 || msg.includes("password") || msg.includes("invalid") || msg.includes("credentials") || msg.includes("bad")) {
        setErrors(p => ({ ...p, password:"Incorrect password. Please try again." }));
      } else if (status === 404 || msg.includes("not found") || msg.includes("user")) {
        setErrors(p => ({ ...p, email:"No account found with this email." }));
      } else if (msg.includes("deactivated") || msg.includes("inactive")) {
        setGlobalErr("Your account has been deactivated. Please contact your administrator.");
      } else {
        setGlobalErr("Sign in failed. Please check your credentials and try again.");
      }
    } finally { setLoading(false); }
  };

  const inputBorder = field => errors[field] ? "var(--danger)" : "var(--border)";

  return (
    <div className="auth-wrap">
      <div style={{ position:"fixed", top:16, right:16 }}><ThemeToggle /></div>

      <div className="auth-card anim-scale">
        {/* Header */}
        <div className="auth-card-head">
          <div className="auth-logo-row">
            <div className="auth-logo-icon"><Link2 size={15} /></div>
            <div>
              <div className="auth-logo-name">KMS Chain</div>
              <div style={{ fontSize:10, color:"var(--text-4)" }}>Blockchain Verification</div>
            </div>
          </div>
          <div className="auth-heading">Sign in</div>
          <div className="auth-sub">Enter your credentials to continue</div>
        </div>

        <div className="auth-card-body">
          {/* Global error banner */}
          {globalErr && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"10px 13px", background:"var(--danger-bg)", border:"1px solid var(--danger-border)", borderRadius:"var(--radius-sm)", marginBottom:16, fontSize:12.5, color:"var(--danger)", animation:"fadeUp .2s ease" }}>
              <AlertCircle size={13} style={{ flexShrink:0, marginTop:1 }} />
              {globalErr}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            {/* Email field */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>
                Email address
              </label>
              <div style={{ position:"relative" }}>
                <Mail size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color: errors.email ? "var(--danger)" : "var(--text-4)", flexShrink:0 }} />
                <input
                  className="form-input"
                  style={{ paddingLeft:33, borderColor: inputBorder("email"), transition:"border-color .12s" }}
                  type="email" name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            {/* Password field */}
            <div style={{ marginBottom:4 }}>
              <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>
                Password
              </label>
              <div style={{ position:"relative" }}>
                <Lock size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color: errors.password ? "var(--danger)" : "var(--text-4)", flexShrink:0 }} />
                <input
                  className="form-input"
                  style={{ paddingLeft:33, paddingRight:38, borderColor: inputBorder("password"), transition:"border-color .12s" }}
                  type={showPw ? "text" : "password"}
                  name="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={set}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                />
                <button type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-4)", display:"flex", padding:"3px" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <FieldError msg={errors.password} />
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}
              style={{ marginTop:18, justifyContent:"center" }}>
              {loading
                ? <><div className="spinner-sm" />Signing in…</>
                : <>Sign in <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div style={{ padding:"9px 12px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--text-4)", textAlign:"center" }}>
            Demo admin: <strong style={{ color:"var(--text-2)" }}>admin@kms.com</strong> / <strong style={{ color:"var(--text-2)" }}>password123</strong>
          </div>

          <div style={{ marginTop:12, textAlign:"center", fontSize:12.5, color:"var(--text-4)" }}>
            Are you an admin?{" "}
            <Link to="/admin-login" style={{ color:"var(--accent)", fontWeight:700 }}>Admin portal →</Link>
          </div>
        </div>

        <div className="auth-card-foot">
          No account?{" "}<Link to="/register" className="auth-link">Create one</Link>
          <span style={{ margin:"0 8px", color:"var(--border-2)" }}>·</span>
          <Link to="/" style={{ color:"var(--text-4)" }}>← Home</Link>
        </div>
      </div>
    </div>
  );
}
