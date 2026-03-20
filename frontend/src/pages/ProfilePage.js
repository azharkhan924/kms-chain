import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Lock, Shield, LogOut, Key, ChevronRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../api/axios";

const SECTIONS = [
  { key:"profile",  Icon:User,   label:"Profile"           },
  { key:"security", Icon:Lock,   label:"Password & Security"},
  { key:"account",  Icon:Shield, label:"Account Details"   },
];

export default function ProfilePage({ onBack }) {
  const { user, logoutUser } = useAuth();
  const { isDark, toggle }   = useTheme();
  const navigate             = useNavigate();
  const [section, setSection]= useState("profile");
  const [pwForm, setPwForm]  = useState({ current:"", newPw:"", confirm:"" });
  const [saving, setSaving]  = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  const initials = user?.fullName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "?";

  const validatePw = () => {
    const e = {};
    if (!pwForm.current)             e.current = "Current password is required";
    if (pwForm.newPw.length < 6)     e.newPw   = "Must be at least 6 characters";
    if (pwForm.newPw !== pwForm.confirm) e.confirm = "Passwords do not match";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const changePassword = async e => {
    e.preventDefault();
    if (!validatePw()) return;
    setSaving(true);
    try {
      await API.put("/api/user/password", { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success("Password updated successfully");
      setPwForm({ current:"", newPw:"", confirm:"" });
      setPwErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password";
      if (msg.toLowerCase().includes("incorrect") || msg.toLowerCase().includes("current")) {
        setPwErrors({ current: "Current password is incorrect" });
      } else {
        toast.error(msg);
      }
    } finally { setSaving(false); }
  };

  const roleColor = { USER:"var(--accent)", VERIFIER:"var(--purple)", ADMIN:"var(--danger)" };
  const roleBg    = { USER:"var(--accent-bg)", VERIFIER:"var(--purple-bg)", ADMIN:"var(--danger-bg)" };
  const roleDesc  = { USER:"Upload and manage your documents", VERIFIER:"Verify document authenticity on the blockchain", ADMIN:"Full system administration and audit access" };

  return (
    <div style={{ animation:"fadeUp .3s ease" }}>
      <div style={{ marginBottom:22 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12.5, color:"var(--text-3)", display:"flex", alignItems:"center", gap:5, marginBottom:10, padding:0, fontFamily:"inherit" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>
          ← Back
        </button>
        <div style={{ fontSize:20, fontWeight:900, color:"var(--text-1)", letterSpacing:"-.3px" }}>Settings</div>
        <div style={{ fontSize:12.5, color:"var(--text-4)" }}>Manage your account preferences</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"190px 1fr", gap:16, alignItems:"start" }}>
        {/* Left nav */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden" }}>
          {/* Avatar */}
          <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid var(--border)", textAlign:"center" }}>
            <div style={{ width:48, height:48, background:"var(--text-1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"var(--surface)", margin:"0 auto 10px" }}>{initials}</div>
            <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text-1)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.fullName}</div>
            <div style={{ display:"inline-flex", marginTop:5, padding:"2px 8px", background:roleBg[user?.role], border:`1px solid ${roleColor[user?.role]}22`, borderRadius:99, fontSize:10, fontWeight:800, color:roleColor[user?.role] }}>
              {user?.role}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding:5 }}>
            {SECTIONS.map(({ key, Icon, label }) => (
              <button key={key} onClick={() => setSection(key)} style={{
                width:"100%", display:"flex", alignItems:"center", gap:8,
                padding:"8px 9px", border:"none", borderRadius:"var(--radius-sm)",
                cursor:"pointer", background:section===key?"var(--bg-alt)":"transparent",
                fontSize:12.5, fontWeight:section===key?700:500,
                color:section===key?"var(--text-1)":"var(--text-3)",
                textAlign:"left", transition:".12s", marginBottom:1, fontFamily:"inherit"
              }}>
                <Icon size={13} />
                {label}
                {section === key && <ChevronRight size={11} style={{ marginLeft:"auto" }} />}
              </button>
            ))}

            {/* Theme toggle */}
            <div style={{ borderTop:"1px solid var(--border)", marginTop:5, paddingTop:5 }}>
              <button onClick={toggle} style={{
                width:"100%", display:"flex", alignItems:"center", gap:8,
                padding:"8px 9px", border:"none", borderRadius:"var(--radius-sm)",
                cursor:"pointer", background:"transparent",
                fontSize:12.5, fontWeight:500, color:"var(--text-3)",
                textAlign:"left", fontFamily:"inherit", justifyContent:"space-between"
              }}>
                <span>{isDark ? "☀ Light mode" : "🌙 Dark mode"}</span>
                <div style={{ width:30, height:16, background:isDark?"var(--accent)":"var(--border-2)", borderRadius:99, position:"relative", transition:".2s", flexShrink:0 }}>
                  <div style={{ position:"absolute", top:2, left:isDark?14:2, width:12, height:12, background:"#fff", borderRadius:"50%", transition:"left .2s" }} />
                </div>
              </button>
            </div>

            <div style={{ borderTop:"1px solid var(--border)", marginTop:5, paddingTop:5 }}>
              <button onClick={() => { logoutUser(); navigate("/login"); }}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 9px", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", background:"transparent", fontSize:12.5, fontWeight:500, color:"var(--danger)", textAlign:"left", fontFamily:"inherit" }}>
                <LogOut size={13} />Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden" }}>

          {/* PROFILE */}
          {section === "profile" && (
            <>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)" }}>Profile information</div>
                <div style={{ fontSize:12, color:"var(--text-4)", marginTop:2 }}>Your name, email, and role on KMS Chain</div>
              </div>
              <div style={{ padding:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 15px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", marginBottom:20 }}>
                  <div style={{ width:44, height:44, background:"var(--text-1)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, color:"var(--surface)", flexShrink:0 }}>{initials}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:800, color:"var(--text-1)" }}>{user?.fullName}</div>
                    <div style={{ fontSize:12, color:"var(--text-4)", marginTop:2 }}>{user?.email}</div>
                  </div>
                </div>
                {[
                  { label:"Full name",  value:user?.fullName, Icon:User  },
                  { label:"Email",      value:user?.email,    Icon:Mail  },
                ].map(({ label, value, Icon }) => (
                  <div key={label} style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>{label}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:9, padding:"9px 12px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                      <Icon size={14} style={{ color:"var(--text-4)", flexShrink:0 }} />
                      <span style={{ fontSize:13.5, color:"var(--text-2)" }}>{value}</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding:"10px 12px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--text-4)" }}>
                  ℹ To change your name or email, contact your system administrator.
                </div>
              </div>
            </>
          )}

          {/* SECURITY */}
          {section === "security" && (
            <>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)" }}>Password & Security</div>
                <div style={{ fontSize:12, color:"var(--text-4)", marginTop:2 }}>Update your password to keep your account secure</div>
              </div>
              <div style={{ padding:18 }}>
                <form onSubmit={changePassword}>
                  {/* Current password */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>Current password</div>
                    <div style={{ position:"relative" }}>
                      <Key size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-4)" }} />
                      <input type="password"
                        style={{ width:"100%", padding:"9px 12px 9px 33px", background:"var(--bg-alt)", border:`1px solid ${pwErrors.current ? "var(--danger)" : "var(--border)"}`, borderRadius:"var(--radius-sm)", fontSize:13.5, color:"var(--text-1)", outline:"none", transition:".12s" }}
                        placeholder="Your current password"
                        value={pwForm.current}
                        onChange={e => { setPwForm(p => ({ ...p, current:e.target.value })); setPwErrors(p => ({ ...p, current:"" })); }}
                        onFocus={e => e.target.style.borderColor = pwErrors.current ? "var(--danger)" : "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = pwErrors.current ? "var(--danger)" : "var(--border)"}
                      />
                    </div>
                    {pwErrors.current && (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:12, color:"var(--danger)", fontWeight:600 }}>
                        ⚠ {pwErrors.current}
                      </div>
                    )}
                  </div>

                  {/* New password */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>New password</div>
                    <div style={{ position:"relative" }}>
                      <Lock size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-4)" }} />
                      <input type="password"
                        style={{ width:"100%", padding:"9px 12px 9px 33px", background:"var(--bg-alt)", border:`1px solid ${pwErrors.newPw ? "var(--danger)" : "var(--border)"}`, borderRadius:"var(--radius-sm)", fontSize:13.5, color:"var(--text-1)", outline:"none", transition:".12s" }}
                        placeholder="At least 6 characters"
                        value={pwForm.newPw}
                        onChange={e => { setPwForm(p => ({ ...p, newPw:e.target.value })); setPwErrors(p => ({ ...p, newPw:"" })); }}
                        onFocus={e => e.target.style.borderColor = pwErrors.newPw ? "var(--danger)" : "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = pwErrors.newPw ? "var(--danger)" : "var(--border)"}
                      />
                    </div>
                    {pwErrors.newPw && (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:12, color:"var(--danger)", fontWeight:600 }}>
                        ⚠ {pwErrors.newPw}
                      </div>
                    )}
                    {/* Password strength */}
                    {pwForm.newPw.length > 0 && (
                      <div style={{ marginTop:6 }}>
                        <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                          {[1,2,3,4].map(n => (
                            <div key={n} style={{ flex:1, height:3, borderRadius:99, background: pwForm.newPw.length >= n*3 ? (pwForm.newPw.length >= 10 ? "var(--ok)" : "var(--warn)") : "var(--border)" }} />
                          ))}
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-4)" }}>
                          {pwForm.newPw.length < 6 ? "Too short" : pwForm.newPw.length < 8 ? "Weak" : pwForm.newPw.length < 10 ? "Fair" : "Strong"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:5 }}>Confirm new password</div>
                    <div style={{ position:"relative" }}>
                      <Lock size={13} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"var(--text-4)" }} />
                      <input type="password"
                        style={{ width:"100%", padding:"9px 12px 9px 33px", background:"var(--bg-alt)", border:`1px solid ${pwErrors.confirm ? "var(--danger)" : (pwForm.confirm && pwForm.newPw === pwForm.confirm ? "var(--ok)" : "var(--border)")}`, borderRadius:"var(--radius-sm)", fontSize:13.5, color:"var(--text-1)", outline:"none", transition:".12s" }}
                        placeholder="Repeat new password"
                        value={pwForm.confirm}
                        onChange={e => { setPwForm(p => ({ ...p, confirm:e.target.value })); setPwErrors(p => ({ ...p, confirm:"" })); }}
                        onFocus={e => e.target.style.borderColor = "var(--accent)"}
                        onBlur={e => e.target.style.borderColor = pwErrors.confirm ? "var(--danger)" : (pwForm.confirm && pwForm.newPw === pwForm.confirm ? "var(--ok)" : "var(--border)")}
                      />
                      {pwForm.confirm && pwForm.newPw === pwForm.confirm && (
                        <Check size={13} style={{ position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", color:"var(--ok)" }} />
                      )}
                    </div>
                    {pwErrors.confirm && (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5, fontSize:12, color:"var(--danger)", fontWeight:600 }}>
                        ⚠ {pwErrors.confirm}
                      </div>
                    )}
                  </div>

                  <button type="submit" disabled={saving}
                    style={{ padding:"9px 18px", background:"var(--text-1)", color:"var(--surface)", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7, opacity:saving?.6:1, fontFamily:"inherit" }}>
                    {saving ? <><div className="spinner-dk" /> Updating…</> : <><Key size={13} />Update password</>}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* ACCOUNT */}
          {section === "account" && (
            <>
              <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)" }}>Account Details</div>
                <div style={{ fontSize:12, color:"var(--text-4)", marginTop:2 }}>Your role and system permissions</div>
              </div>
              <div style={{ padding:18 }}>
                {/* Role card */}
                <div style={{ padding:"14px 16px", background:roleBg[user?.role], border:`1px solid ${roleColor[user?.role]}33`, borderRadius:"var(--radius-sm)", marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:38, height:38, background:"var(--text-1)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--surface)", flexShrink:0 }}>
                      <Shield size={17} />
                    </div>
                    <div>
                      <div style={{ display:"inline-flex", padding:"2px 9px", background:roleBg[user?.role], border:`1px solid ${roleColor[user?.role]}44`, borderRadius:99, fontSize:11, fontWeight:800, color:roleColor[user?.role], marginBottom:4 }}>{user?.role}</div>
                      <div style={{ fontSize:12.5, color:"var(--text-3)" }}>{roleDesc[user?.role]}</div>
                    </div>
                  </div>
                </div>

                {[
                  ["Account ID", `#${user?.userId || "—"}`],
                  ["Email",      user?.email],
                  ["Role",       user?.role],
                  ["Status",     "Active"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)", fontSize:13 }}>
                    <span style={{ color:"var(--text-3)", fontWeight:500 }}>{k}</span>
                    <span style={{ fontWeight:700, color:"var(--text-1)" }}>{v}</span>
                  </div>
                ))}

                {/* Danger zone */}
                <div style={{ marginTop:20, padding:"13px 15px", background:"var(--danger-bg)", border:"1px solid var(--danger-border)", borderRadius:"var(--radius-sm)" }}>
                  <div style={{ fontSize:12.5, fontWeight:800, color:"var(--danger)", marginBottom:5 }}>Danger zone</div>
                  <div style={{ fontSize:12, color:"var(--danger)", opacity:.8, marginBottom:10 }}>Signing out will end your session immediately.</div>
                  <button onClick={() => { logoutUser(); navigate("/login"); }}
                    style={{ padding:"6px 13px", background:"var(--surface)", border:"1px solid var(--danger-border)", borderRadius:"var(--radius-sm)", fontSize:12, fontWeight:700, color:"var(--danger)", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"inherit" }}>
                    <LogOut size={12} />Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
