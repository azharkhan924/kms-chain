import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Users, FileText, ShieldCheck, ScrollText,
  Link2, Pencil, ToggleLeft, ToggleRight, X, ChevronRight,
  BarChart3, Star, Clock, AlertTriangle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import ProfilePage from "./ProfilePage";
import {
  DocumentStatusPie, VerificationTrend, UserRoleBar,
  CategoryBar, TrustScoreGauge
} from "../components/Charts";
import {
  getAdminStats, getAllUsers, getAllDocumentsAdmin,
  getAllVerificationLogs, getAuditLogs, getBlockchainStatus,
  updateUserRole, toggleUserStatus, getAllTrustScores
} from "../api/services";

const fmtDate = d => d ? new Date(d).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";

const badgeClass = action => {
  if (!action) return "badge-rejected";
  const a = action.toUpperCase();
  if (a.includes("LOGIN"))   return "badge-user";
  if (a.includes("VERIFY"))  return "badge-verified";
  if (a.includes("UPLOAD") || a.includes("VERSION")) return "badge-verifier";
  if (a.includes("DELETE"))  return "badge-tampered";
  if (a.includes("ROLE") || a.includes("STATUS")) return "badge-admin";
  if (a.includes("EXPIRE"))  return "badge-pending";
  return "badge-pending";
};

const TRUST_COLOR = s => s >= 85 ? "var(--ok)" : s >= 70 ? "var(--accent)" : s >= 50 ? "var(--warn)" : s >= 30 ? "#ea580c" : "var(--danger)";
const TRUST_GRADE = s => s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 50 ? "Fair" : s >= 30 ? "Low" : "Critical";
const TRUST_BG    = s => s >= 85 ? "var(--ok-bg)" : s >= 70 ? "var(--accent-bg)" : s >= 50 ? "var(--warn-bg)" : s >= 30 ? "#fff7ed" : "var(--danger-bg)";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab]         = useState("dashboard");
  const [stats, setStats]     = useState(null);
  const [users, setUsers]     = useState([]);
  const [docs, setDocs]       = useState([]);
  const [vLogs, setVLogs]     = useState([]);
  const [aLogs, setALogs]     = useState([]);
  const [chain, setChain]     = useState(null);
  const [trust, setTrust]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole]   = useState("");
  const [search, setSearch]     = useState("");

  const load = useCallback(async which => {
    setLoading(true);
    try {
      if (which === "dashboard") {
        const [sr, vr, ur] = await Promise.all([getAdminStats(), getAllVerificationLogs(), getAllUsers()]);
        setStats(sr.data.data); setVLogs(vr.data.data || []); setUsers(ur.data.data || []);
      }
      if (which === "users")      { const [r, tr] = await Promise.all([getAllUsers(), getAllTrustScores()]); setUsers(r.data.data||[]); setTrust(tr.data.data||[]); }
      if (which === "documents")  { const r = await getAllDocumentsAdmin();   setDocs(r.data.data||[]); }
      if (which === "verif-logs") { const r = await getAllVerificationLogs(); setVLogs(r.data.data||[]); }
      if (which === "audit")      { const r = await getAuditLogs();           setALogs(r.data.data||[]); }
      if (which === "blockchain") { const r = await getBlockchainStatus();    setChain(r.data.data); }
      if (which === "trust")      { const r = await getAllTrustScores();      setTrust(r.data.data||[]); }
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(tab); setSearch(""); }, [tab, load]);

  const handleRoleUpdate = async () => {
    if (!editUser || !newRole) return;
    try {
      const { data } = await updateUserRole(editUser.id, newRole);
      setUsers(p => p.map(u => u.id === editUser.id ? data.data : u));
      toast.success("Role updated"); setEditUser(null);
    } catch { toast.error("Failed to update role"); }
  };

  const handleToggle = async id => {
    try {
      const { data } = await toggleUserStatus(id);
      setUsers(p => p.map(u => u.id === id ? data.data : u));
      toast.success("Status updated");
    } catch { toast.error("Failed"); }
  };

  const TAB_LABELS = {
    dashboard:"Overview", users:"Users", documents:"Documents",
    "verif-logs":"Verif. Logs", audit:"Audit", blockchain:"Blockchain",
    trust:"Trust Scores", profile:"Settings"
  };

  const adminCount    = users.filter(u => u.role === "ADMIN").length;
  const verifierCount = users.filter(u => u.role === "VERIFIER").length;
  const userCount     = users.filter(u => u.role === "USER").length;
  const expiringDocs  = docs.filter(d => {
    if (!d.expiryDate) return false;
    const diff = Math.ceil((new Date(d.expiryDate) - new Date()) / 86400000);
    return diff >= 0 && diff <= 30;
  }).length;

  return (
    <div className="app-layout">
      <Sidebar active={tab} onNav={setTab} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{TAB_LABELS[tab]}</div>
            <div className="topbar-sub">{user?.fullName} · Administrator</div>
          </div>
          <div className="topbar-right">
            <ThemeToggle size="sm" />
            {tab === "blockchain" && chain && (
              <>
                <span className={`badge ${chain.isValid ? "badge-verified" : "badge-tampered"}`}>
                  <span className="badge-dot" />{chain.isValid ? "Chain valid" : "Chain invalid"}
                </span>
                <span className="tag">{chain.chainSize} blocks</span>
              </>
            )}
          </div>
        </div>

        <div className="page-body">
          {tab === "profile" && <ProfilePage onBack={() => setTab("dashboard")} />}

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && stats && (
            <>
              {/* Stat cards */}
              <div className="stats-grid">
                {[
                  { label:"Documents",   val:stats.totalDocuments,    color:"muted",  Icon:FileText     },
                  { label:"Verified",    val:stats.verifiedDocuments, color:"green",  Icon:ShieldCheck  },
                  { label:"Tampered",    val:stats.tamperedDocuments, color:"red",    Icon:AlertTriangle},
                  { label:"Expired",     val:stats.expiredDocuments||0, color:"yellow",Icon:Clock       },
                  { label:"Users",       val:stats.totalUsers,        color:"blue",   Icon:Users        },
                  { label:"Verifiers",   val:stats.totalVerifiers,    color:"purple", Icon:ShieldCheck  },
                ].map(({ label, val, color, Icon }, i) => (
                  <div className="stat-card anim-in" key={label} style={{ animationDelay:`${i*.04}s` }}>
                    <div className="stat-header"><span className="stat-label">{label}</span><div className={`stat-icon ${color}`}><Icon size={13} /></div></div>
                    <div className="stat-value">{val}</div>
                    <div className="stat-desc">system wide</div>
                  </div>
                ))}
              </div>

              {/* Charts row 1 */}
              <div className="grid-3 mb-16" style={{ alignItems:"start" }}>
                <div className="card anim-in" style={{ animationDelay:".24s" }}>
                  <div className="card-header"><span className="card-title"><ShieldCheck size={13} />Document status</span></div>
                  <div style={{ padding:"10px 14px 14px" }}>
                    <DocumentStatusPie
                      verified={stats.verifiedDocuments}
                      tampered={stats.tamperedDocuments}
                      pending={stats.pendingDocuments||0}
                      expired={stats.expiredDocuments||0}
                    />
                  </div>
                </div>
                <div className="card anim-in" style={{ animationDelay:".28s" }}>
                  <div className="card-header"><span className="card-title"><Users size={13} />Users by role</span></div>
                  <div style={{ padding:"10px 14px 14px" }}>
                    <UserRoleBar admin={adminCount} verifier={verifierCount} user={userCount} />
                  </div>
                </div>
                <div className="card anim-in" style={{ animationDelay:".32s" }}>
                  <div className="card-header"><span className="card-title"><BarChart3 size={13} />7-day verifications</span></div>
                  <div style={{ padding:"10px 14px 14px" }}>
                    <VerificationTrend logs={vLogs} />
                  </div>
                </div>
              </div>

              {/* Charts row 2 — categories + quick actions + health */}
              <div className="grid-3 mb-16" style={{ alignItems:"start" }}>
                <div className="card anim-in" style={{ animationDelay:".34s" }}>
                  <div className="card-header"><span className="card-title"><FileText size={13} />By category</span></div>
                  <div style={{ padding:"10px 14px 14px" }}>
                    <CategoryBar stats={stats.categoryStats || []} />
                  </div>
                </div>
                <div className="card anim-in" style={{ animationDelay:".38s" }}>
                  <div className="card-header"><span className="card-title"><LayoutDashboard size={13} />Quick actions</span></div>
                  <div style={{ padding:6 }}>
                    {[
                      { key:"users",      Icon:Users,     label:"Manage users",       sub:`${stats.totalUsers} accounts`           },
                      { key:"documents",  Icon:FileText,  label:"All documents",       sub:`${stats.totalDocuments} total`          },
                      { key:"verif-logs", Icon:ShieldCheck,label:"Verification logs",  sub:`${stats.verifiedDocuments+stats.tamperedDocuments} records` },
                      { key:"trust",      Icon:Star,      label:"Trust scores",        sub:`${stats.totalUsers} users scored`       },
                      { key:"blockchain", Icon:Link2,     label:"Blockchain explorer", sub:`${stats.blockchainSize} blocks`         },
                    ].map(({ key, Icon, label, sub }) => (
                      <button key={key} onClick={() => setTab(key)}
                        style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"9px 11px", border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", background:"transparent", fontFamily:"inherit", transition:".12s", textAlign:"left" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width:28, height:28, background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)", flexShrink:0 }}><Icon size={13} /></div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text-1)" }}>{label}</div>
                          <div style={{ fontSize:11, color:"var(--text-4)" }}>{sub}</div>
                        </div>
                        <ChevronRight size={12} style={{ color:"var(--text-4)" }} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card anim-in" style={{ animationDelay:".42s" }}>
                  <div className="card-header"><span className="card-title"><ShieldCheck size={13} />System health</span></div>
                  <div className="card-body">
                    {[
                      ["Blockchain",         stats.chainValid ? "✅ Valid" : "❌ Compromised",                                          stats.chainValid ? "var(--ok)" : "var(--danger)"],
                      ["Total blocks",       stats.blockchainSize,                                                                     "var(--text-1)"],
                      ["Expiring (30 days)", expiringDocs + " doc(s)",                                                                expiringDocs > 0 ? "var(--warn)" : "var(--ok)"],
                      ["Tamper rate",        stats.totalDocuments > 0 ? `${((stats.tamperedDocuments/stats.totalDocuments)*100).toFixed(1)}%` : "0%", stats.tamperedDocuments > 0 ? "var(--danger)" : "var(--ok)"],
                      ["Verification rate",  stats.totalDocuments > 0 ? `${Math.round(((stats.verifiedDocuments+stats.tamperedDocuments)/stats.totalDocuments)*100)}%` : "0%", "var(--text-1)"],
                    ].map(([k,v,c]) => (
                      <div key={k} className="detail-row">
                        <span className="detail-key" style={{ textTransform:"none", fontSize:12 }}>{k}</span>
                        <span style={{ fontWeight:700, color:c, fontSize:13 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>Users</span>
                  <span className="tag">{users.length}</span>
                </div>
                <div className="search-box">
                  <Users className="search-box-icon" />
                  <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div> : (
                  <table>
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Trust</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.filter(u => !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => {
                        const ts = trust.find(t => t.email === u.email);
                        const sc = ts ? Number(ts.trustScore) : null;
                        return (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                <div style={{ width:28, height:28, background:"var(--text-1)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"var(--surface)", flexShrink:0 }}>
                                  {u.fullName?.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2)}
                                </div>
                                <strong style={{ fontSize:12.5 }}>{u.fullName}</strong>
                              </div>
                            </td>
                            <td style={{ fontSize:12, color:"var(--text-3)" }}>{u.email}</td>
                            <td><StatusBadge value={u.role} /></td>
                            <td><StatusBadge value={u.active} /></td>
                            <td>
                              {sc !== null ? (
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <div style={{ width:32, height:6, background:"var(--bg-alt)", borderRadius:99, overflow:"hidden", border:"1px solid var(--border)" }}>
                                    <div style={{ width:`${sc}%`, height:"100%", background:TRUST_COLOR(sc), borderRadius:99, transition:"width .5s" }} />
                                  </div>
                                  <span style={{ fontSize:11, fontWeight:800, color:TRUST_COLOR(sc) }}>{sc}</span>
                                </div>
                              ) : <span style={{ fontSize:11, color:"var(--text-4)" }}>—</span>}
                            </td>
                            <td style={{ fontSize:11.5, color:"var(--text-4)" }}>{fmtDate(u.createdAt)}</td>
                            <td>
                              <div style={{ display:"flex", gap:5 }}>
                                <button className="btn btn-secondary btn-sm" style={{ padding:"4px 8px", gap:4 }} onClick={() => { setEditUser(u); setNewRole(u.role); }}>
                                  <Pencil size={11} />Role
                                </button>
                                <button className={`btn btn-sm ${u.active ? "btn-danger" : "btn-success"}`} style={{ padding:"4px 8px", gap:4 }} onClick={() => handleToggle(u.id)}>
                                  {u.active ? <><ToggleLeft size={12} />Deactivate</> : <><ToggleRight size={12} />Activate</>}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {tab === "documents" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>All documents</span>
                  <span className="tag">{docs.length}</span>
                </div>
                <div className="search-box">
                  <FileText className="search-box-icon" />
                  <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div> : (
                  <table>
                    <thead><tr><th>File</th><th>Uploaded by</th><th>Category</th><th>Status</th><th>Version</th><th>Expiry</th><th>Registered</th></tr></thead>
                    <tbody>
                      {docs.filter(d => !search || d.originalFileName?.toLowerCase().includes(search.toLowerCase())).map(d => {
                        const expDiff = d.expiryDate ? Math.ceil((new Date(d.expiryDate) - new Date()) / 86400000) : null;
                        return (
                          <tr key={d.id}>
                            <td>
                              <strong style={{ fontSize:12.5 }}>{d.originalFileName}</strong>
                              {d.description && <div style={{ fontSize:11, color:"var(--text-4)", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.description}</div>}
                            </td>
                            <td style={{ fontSize:12, color:"var(--text-3)" }}>{d.uploadedBy}</td>
                            <td><span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:99, padding:"2px 8px" }}>{d.category||"OTHER"}</span></td>
                            <td><StatusBadge value={d.status} /></td>
                            <td style={{ fontSize:11, fontWeight:700, color:"var(--text-3)" }}>v{d.versionNumber||1}</td>
                            <td>
                              {d.expiryDate ? (
                                <span style={{ fontSize:10.5, fontWeight:700, color: expDiff !== null && expDiff < 0 ? "var(--text-4)" : expDiff !== null && expDiff <= 7 ? "var(--danger)" : expDiff !== null && expDiff <= 30 ? "var(--warn)" : "var(--text-4)" }}>
                                  {expDiff !== null && expDiff < 0 ? "Expired" : expDiff !== null && expDiff <= 30 ? `${expDiff}d left` : new Date(d.expiryDate).toLocaleDateString()}
                                </span>
                              ) : <span style={{ fontSize:11, color:"var(--text-4)" }}>—</span>}
                            </td>
                            <td style={{ fontSize:11.5, color:"var(--text-4)", whiteSpace:"nowrap" }}>{fmtDate(d.uploadedAt)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── VERIF LOGS ── */}
          {tab === "verif-logs" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>Verification logs</span>
                  <span className="tag">{vLogs.length}</span>
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div> : (
                  <table>
                    <thead><tr><th>Document</th><th>Verified by</th><th>Result</th><th>Remarks</th><th>Date</th></tr></thead>
                    <tbody>
                      {vLogs.map((l, i) => (
                        <tr key={i}>
                          <td><strong style={{ fontSize:12.5 }}>{l.originalFileName}</strong></td>
                          <td style={{ fontSize:12, color:"var(--text-3)" }}>{l.verifiedBy}</td>
                          <td><StatusBadge value={l.verified ? "VERIFIED" : "TAMPERED"} /></td>
                          <td style={{ fontSize:12, color:"var(--text-4)", maxWidth:260 }}>{l.remarks}</td>
                          <td style={{ fontSize:11.5, color:"var(--text-4)", whiteSpace:"nowrap" }}>{fmtDate(l.verifiedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── AUDIT TRAIL ── */}
          {tab === "audit" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>Audit trail</span>
                  <span className="tag">{aLogs.length}</span>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <div className="search-box">
                    <ScrollText className="search-box-icon" />
                    <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => {
                    const rows = ["Action,Performed By,Details,Date",...aLogs.map(l=>`${l.action},${l.performedBy},"${l.details||""}",${l.createdAt||""}`)] .join("\n");
                    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows],{type:"text/csv"})); a.download = "audit.csv"; a.click();
                  }}>↓ Export CSV</button>
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div> : (
                  <table>
                    <thead><tr><th>Action</th><th>Performed by</th><th>Details</th><th>Date</th></tr></thead>
                    <tbody>
                      {aLogs.filter(l => !search || l.action?.toLowerCase().includes(search.toLowerCase()) || l.performedBy?.toLowerCase().includes(search.toLowerCase())).map(l => (
                        <tr key={l.id}>
                          <td><span className={`badge ${badgeClass(l.action)}`}><span className="badge-dot" />{l.action}</span></td>
                          <td style={{ fontSize:12, fontWeight:600, color:"var(--text-2)" }}>{l.performedBy}</td>
                          <td style={{ fontSize:12, color:"var(--text-4)", maxWidth:360 }}>{l.details}</td>
                          <td style={{ fontSize:11.5, color:"var(--text-4)", whiteSpace:"nowrap" }}>{fmtDate(l.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── BLOCKCHAIN ── */}
          {tab === "blockchain" && chain && (
            <div className="anim-in">
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:11, marginBottom:18 }}>
                {[
                  ["Total blocks",  chain.chainSize,                            "var(--text-1)"],
                  ["Status",        chain.isValid ? "✅ Valid" : "❌ Invalid", chain.isValid ? "var(--ok)" : "var(--danger)"],
                  ["Latest block",  `#${chain.chainSize-1}`,                   "var(--text-1)"],
                  ["Integrity",     chain.isValid ? "Intact" : "Compromised",  chain.isValid ? "var(--ok)" : "var(--danger)"],
                ].map(([k,v,c]) => (
                  <div key={k} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"13px 15px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>{k}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="section-title"><Link2 size={14} />All blocks ({chain.blocks?.length})</div>
              {loading ? <div className="empty-state"><div className="spinner" /></div> :
                chain.blocks?.map((b, i) => (
                  <div key={b.index}>
                    <div className={`chain-block${b.index===0?" genesis":""}`} style={{ animationDelay:`${i*.02}s` }}>
                      <div className="chain-block-head">
                        <span className="chain-block-title">{b.index===0?"Genesis block":`Block #${b.index}`}</span>
                        <span className="chain-block-time">{b.timestamp?.slice(0,19).replace("T"," ")}</span>
                      </div>
                      <div className="chain-field"><span className="chain-key">Block hash</span><span className="chain-val">{b.hash}</span></div>
                      <div className="chain-field"><span className="chain-key">Prev hash</span><span className="chain-val">{b.previousHash}</span></div>
                      <div className="chain-field"><span className="chain-key">Doc hash</span><span className="chain-val">{b.documentHash}</span></div>
                      <div className="chain-field"><span className="chain-key">Document</span><span className="chain-val" style={{ fontFamily:"inherit", color:"var(--text-3)" }}>{b.documentId}</span></div>
                    </div>
                    {i < chain.blocks.length-1 && <div className="chain-connector">↕</div>}
                  </div>
                ))
              }
            </div>
          )}

          {/* ── TRUST SCORES ── */}
          {tab === "trust" && (
            <div className="anim-in">
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:13, color:"var(--text-3)", lineHeight:1.6, maxWidth:680 }}>
                  Trust scores (0–100) are computed from each user's document history — uploads, verifications, tamper incidents, and account age. Higher scores indicate more trustworthy behaviour on the platform.
                </div>
              </div>

              {loading ? <div className="empty-state"><div className="spinner" /></div> : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
                  {[...trust].sort((a,b) => b.trustScore - a.trustScore).map((t, i) => {
                    const sc = Number(t.trustScore);
                    return (
                      <div key={t.userId} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden", transition:"all .15s", animationDelay:`${i*.04}s` }}
                        className="anim-in">
                        {/* Color stripe */}
                        <div style={{ height:3, background:TRUST_COLOR(sc) }} />
                        <div style={{ padding:"16px 18px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            {/* Gauge */}
                            <TrustScoreGauge score={sc} />
                            {/* Info */}
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)", marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.fullName}</div>
                              <div style={{ fontSize:11.5, color:"var(--text-4)", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.email}</div>
                              <div style={{ display:"flex", gap:5 }}>
                                <StatusBadge value={t.role} />
                                <span style={{ fontSize:11, fontWeight:800, color:TRUST_COLOR(sc), background:TRUST_BG(sc), border:`1px solid ${TRUST_COLOR(sc)}33`, borderRadius:99, padding:"2px 8px" }}>{TRUST_GRADE(sc)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Breakdown */}
                          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                            <div style={{ fontSize:10.5, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:7 }}>Score breakdown</div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 12px" }}>
                              {[
                                ["Uploads",        t.uploads,        "var(--text-2)"],
                                ["Verified docs",  t.verified,       "var(--ok)"    ],
                                ["Tampered",       t.tampered,       t.tampered > 0 ? "var(--danger)" : "var(--text-4)"],
                                ["Verifications",  t.verifications,  "var(--accent)"],
                              ].map(([k,v,c]) => (
                                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                                  <span style={{ color:"var(--text-4)" }}>{k}</span>
                                  <span style={{ fontWeight:700, color:c }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div style={{ marginTop:8, fontSize:11.5, color:"var(--text-3)", fontStyle:"italic" }}>
                            {t.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Role Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Change role — {editUser.fullName}</span>
              <button className="modal-close" onClick={() => setEditUser(null)}><X size={13} /></button>
            </div>
            <div className="modal-body">
              <div style={{ padding:"9px 12px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--text-3)", marginBottom:14 }}>
                Current: <strong style={{ color:"var(--text-1)" }}>{editUser.role}</strong> · {editUser.email}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  ["USER",     "Upload and manage documents"],
                  ["VERIFIER", "Verify document authenticity"],
                  ["ADMIN",    "Full system administration"],
                ].map(([r, desc]) => (
                  <label key={r} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 11px", background:newRole===r?"var(--accent-bg)":"var(--surface)", border:`1px solid ${newRole===r?"var(--accent)":"var(--border)"}`, borderRadius:"var(--radius-sm)", cursor:"pointer", transition:".12s" }}>
                    <input type="radio" value={r} checked={newRole===r} onChange={() => setNewRole(r)} />
                    <div>
                      <div style={{ fontSize:12.5, fontWeight:700, color:"var(--text-1)" }}>{r}</div>
                      <div style={{ fontSize:11, color:"var(--text-4)" }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleRoleUpdate}>Update role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
