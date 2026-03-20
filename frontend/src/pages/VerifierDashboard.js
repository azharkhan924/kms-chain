import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ShieldCheck, CheckCircle2, XCircle, BarChart3, FileSearch, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import FileDropZone from "../components/FileDropZone";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import { VerificationTrend } from "../components/Charts";
import ProfilePage from "./ProfilePage";
import { getAllDocumentsVerifier, verifyDocument, getMyVerificationLogs } from "../api/services";

const fmtDate = d => d ? new Date(d).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";

export default function VerifierDashboard() {
  const { user } = useAuth();
  const [tab, setTab]       = useState("dashboard");
  const [docs, setDocs]     = useState([]);
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [verifyFile, setVerifyFile]   = useState(null);
  const [remarks, setRemarks]         = useState("");
  const [verifying, setVerifying]     = useState(false);
  const [result, setResult]           = useState(null);
  const [search, setSearch]           = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [d, l] = await Promise.all([getAllDocumentsVerifier(), getMyVerificationLogs()]);
      setDocs(d.data.data || []);
      setLogs(l.data.data || []);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openVerify = doc => { setSelectedDoc(doc); setVerifyFile(null); setRemarks(""); setResult(null); setTab("verify"); };

  const handleVerify = async e => {
    e.preventDefault();
    if (!selectedDoc) return toast.error("Select a document first");
    if (!verifyFile)  return toast.error("Upload the file to verify");
    setVerifying(true);
    try {
      const fd = new FormData(); fd.append("file", verifyFile); if (remarks) fd.append("remarks", remarks);
      const { data } = await verifyDocument(selectedDoc.id, fd);
      setResult(data.data); toast.success("Verification complete"); loadData();
    } catch (err) { toast.error(err.response?.data?.message || "Verification failed"); }
    finally { setVerifying(false); }
  };

  const verified  = logs.filter(l => l.verified).length;
  const tampered  = logs.filter(l => !l.verified).length;
  const accuracy  = logs.length ? Math.round((verified / logs.length) * 100) : 0;

  const titles = { dashboard:"Overview", verify:"Verify document", logs:"Verification history", profile:"Settings" };

  return (
    <div className="app-layout">
      <Sidebar active={tab} onNav={k => { setTab(k); if (k !== "verify") setResult(null); }} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{titles[tab]}</div>
            <div className="topbar-sub">{user?.fullName} · Verifier</div>
          </div>
          <div className="topbar-right">
            <ThemeToggle size="sm" />
            {tab === "dashboard" && (
              <button className="btn btn-primary btn-sm" onClick={() => setTab("verify")}><ShieldCheck size={13} />Verify</button>
            )}
          </div>
        </div>

        <div className="page-body">
          {tab === "profile" && <ProfilePage onBack={() => setTab("dashboard")} />}

          {/* OVERVIEW */}
          {tab === "dashboard" && (
            <>
              <div className="stats-grid">
                {[
                  { label:"To verify",  val:docs.length,  color:"muted",  Icon:FileSearch    },
                  { label:"Verified",   val:verified,     color:"green",  Icon:CheckCircle2  },
                  { label:"Tampered",   val:tampered,     color:"red",    Icon:XCircle       },
                  { label:"Accuracy",   val:`${accuracy}%`, color:"blue", Icon:BarChart3     },
                ].map(({ label, val, color, Icon }, i) => (
                  <div className="stat-card anim-in" key={label} style={{ animationDelay:`${i*.05}s` }}>
                    <div className="stat-header"><span className="stat-label">{label}</span><div className={`stat-icon ${color}`}><Icon size={14} /></div></div>
                    <div className="stat-value">{val}</div>
                    <div className="stat-desc">all time</div>
                  </div>
                ))}
              </div>

              {/* 7-day trend */}
              <div className="card anim-in mb-20" style={{ animationDelay:".18s" }}>
                <div className="card-header"><span className="card-title"><BarChart3 size={14} />7-day verification trend</span></div>
                <div style={{ padding:"12px 16px 14px" }}><VerificationTrend logs={logs} /></div>
              </div>

              <div className="grid-2" style={{ alignItems:"start" }}>
                <div className="card anim-in" style={{ animationDelay:".22s" }}>
                  <div className="card-header">
                    <span className="card-title"><ShieldCheck size={14} />Pending verification</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("verify")}>Start →</button>
                  </div>
                  {docs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon"><CheckCircle2 size={18} /></div>
                      <div className="empty-title">All caught up</div>
                      <div className="empty-desc">No documents awaiting verification</div>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Document</th><th>Uploaded by</th><th>Category</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                          {docs.slice(0,6).map(d => (
                            <tr key={d.id}>
                              <td><strong style={{ fontSize:12.5 }}>{d.originalFileName}</strong><div style={{ fontSize:11, color:"var(--text-4)" }}>{fmtDate(d.uploadedAt)}</div></td>
                              <td style={{ fontSize:12, color:"var(--text-3)" }}>{d.uploadedBy}</td>
                              <td><span style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:99, padding:"2px 8px" }}>{d.category||"OTHER"}</span></td>
                              <td><StatusBadge value={d.status} /></td>
                              <td><button className="btn btn-primary btn-sm" onClick={() => openVerify(d)}><ShieldCheck size={12} />Verify</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="card anim-in" style={{ animationDelay:".26s" }}>
                  <div className="card-header"><span className="card-title"><BarChart3 size={14} />Statistics</span></div>
                  <div className="card-body">
                    <div style={{ marginBottom:18 }}>
                      <div className="flex-between" style={{ fontSize:12, marginBottom:6 }}>
                        <span style={{ color:"var(--text-3)" }}>Accuracy rate</span>
                        <span style={{ fontWeight:700, color:"var(--text-1)" }}>{accuracy}%</span>
                      </div>
                      <div className="progress"><div className="progress-bar green" style={{ width:`${accuracy}%` }} /></div>
                    </div>
                    {[["Total verifications", logs.length,"var(--text-1)"],["Verified",verified,"var(--ok)"],["Tampered",tampered,"var(--danger)"]].map(([k,v,c]) => (
                      <div key={k} className="detail-row">
                        <span className="detail-key" style={{ textTransform:"none", fontSize:12.5, fontWeight:500 }}>{k}</span>
                        <span style={{ fontWeight:800, fontSize:17, color:c }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VERIFY */}
          {tab === "verify" && (
            <div style={{ maxWidth:600 }} className="anim-in">
              <div className="card mb-16">
                <div className="card-header"><span className="card-title"><FileSearch size={14} />Select document</span></div>
                <div className="card-body">
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="form-label">Document to verify</label>
                    <select className="form-select" value={selectedDoc?.id || ""}
                      onChange={e => { setSelectedDoc(docs.find(x => x.id === +e.target.value) || null); setResult(null); }}>
                      <option value="">— Select a document —</option>
                      {docs.map(d => <option key={d.id} value={d.id}>{d.originalFileName} · {d.uploadedBy}</option>)}
                    </select>
                  </div>
                  {selectedDoc && (
                    <div style={{ marginTop:12, padding:"11px 13px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                      <div className="flex-between" style={{ marginBottom:6 }}>
                        <strong style={{ fontSize:13, color:"var(--text-1)" }}>{selectedDoc.originalFileName}</strong>
                        <StatusBadge value={selectedDoc.status} />
                      </div>
                      <div style={{ fontSize:11.5, color:"var(--text-4)" }}>Uploaded by {selectedDoc.uploadedBy} · {fmtDate(selectedDoc.uploadedAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title"><ShieldCheck size={14} />Verification</span></div>
                <div className="card-body">
                  <div className="info-strip info">
                    <ShieldCheck className="info-strip-icon" />
                    <div className="info-strip-text"><strong>How it works:</strong> The file's SHA-256 hash is computed and compared against the blockchain record.</div>
                  </div>
                  <form onSubmit={handleVerify}>
                    <div className="form-group">
                      <label className="form-label">File to verify</label>
                      <FileDropZone file={verifyFile} onFile={setVerifyFile} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Remarks <span style={{ textTransform:"none", fontWeight:400, color:"var(--text-4)" }}>(optional)</span></label>
                      <textarea className="form-textarea" rows={2} placeholder="Add remarks…"
                        value={remarks} onChange={e => setRemarks(e.target.value)} />
                    </div>
                    <button className="btn btn-primary btn-lg btn-block" type="submit"
                      disabled={verifying || !selectedDoc || !verifyFile} style={{ justifyContent:"center" }}>
                      {verifying ? <><div className="spinner-sm" />Verifying…</> : <><ShieldCheck size={14} />Run verification</>}
                    </button>
                  </form>

                  {result && (
                    <div className={`verify-result ${result.verified ? "success" : "danger"}`}>
                      <div className="verify-icon">{result.verified ? "✅" : "❌"}</div>
                      <div className="verify-title" style={{ color:result.verified ? "var(--ok)" : "var(--danger)" }}>
                        {result.verified ? "Document Verified — Authentic" : "Tampered — Hash Mismatch"}
                      </div>
                      <div className="verify-sub">{result.remarks}</div>
                      <div className="hash-compare">
                        <div className="hash-row">
                          <div className="hash-row-label">Computed hash (uploaded file)</div>
                          <div className="hash-row-value" style={{ color:result.verified ? "var(--ok)" : "var(--danger)" }}>{result.computedHash}</div>
                        </div>
                        <div className="hash-row">
                          <div className="hash-row-label">Blockchain hash (original)</div>
                          <div className="hash-row-value">{result.storedHash}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LOGS */}
          {tab === "logs" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>Verification history</span>
                  <span className="tag">{logs.length}</span>
                </div>
                <div className="search-box">
                  <FileSearch className="search-box-icon" />
                  <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div>
                  : logs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon"><ShieldCheck size={18} /></div>
                      <div className="empty-title">No verifications yet</div>
                    </div>
                  ) : (
                    <table>
                      <thead><tr><th>Document</th><th>Result</th><th>Match</th><th>Remarks</th><th>Date</th></tr></thead>
                      <tbody>
                        {logs.filter(l => !search || l.originalFileName?.toLowerCase().includes(search.toLowerCase())).map((l,i) => (
                          <tr key={i}>
                            <td><strong style={{ fontSize:12.5 }}>{l.originalFileName}</strong></td>
                            <td><StatusBadge value={l.verified ? "VERIFIED" : "TAMPERED"} /></td>
                            <td>
                              <span style={{ fontSize:11.5, color: l.verified ? "var(--ok)" : "var(--danger)", fontWeight:600 }}>
                                {l.verified ? "✓ Match" : "✗ Mismatch"}
                              </span>
                            </td>
                            <td style={{ fontSize:12, color:"var(--text-4)", maxWidth:200 }}>{l.remarks}</td>
                            <td style={{ fontSize:11.5, color:"var(--text-4)", whiteSpace:"nowrap" }}>{fmtDate(l.verifiedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
