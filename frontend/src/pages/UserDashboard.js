import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Upload, FileText, ShieldCheck, AlertTriangle, Clock, Eye, Trash2, X,
  Copy, ExternalLink, QrCode, History, GitBranch, Layers, Download, Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import FileDropZone from "../components/FileDropZone";
import StatusBadge from "../components/StatusBadge";
import ThemeToggle from "../components/ThemeToggle";
import ProfilePage from "./ProfilePage";
import { TrustScoreGauge } from "../components/Charts";
import {
  uploadDocument, getMyDocuments, deleteDocument,
  batchUploadDocuments, uploadNewVersion,
  getDocumentVersions, getQRCodeBase64,
  getMyTrustScore
} from "../api/services";

const fmtDate = d => d ? new Date(d).toLocaleString("en-US",{ month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const fmtDateOnly = d => d ? new Date(d).toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }) : null;
const FileEmoji = ({ mime }) => (mime?.includes("pdf") ? "📕" : mime?.includes("image") ? "🖼" : "📄");

const CATEGORIES = ["OTHER","LEGAL","ACADEMIC","FINANCIAL","MEDICAL","CONTRACT","CERTIFICATE","IDENTITY"];
const CAT_COLORS = { LEGAL:"#2563eb",ACADEMIC:"#7c3aed",FINANCIAL:"#16a34a",MEDICAL:"#dc2626",CONTRACT:"#ca8a04",CERTIFICATE:"#ea580c",IDENTITY:"#0891b2",OTHER:"#71717a" };

function ExpiryBadge({ expiryDate }) {
  if (!expiryDate) return null;
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / 86400000);
  if (diff < 0)   return <span style={{ fontSize:10,fontWeight:700,color:"var(--text-4)",background:"var(--bg-alt)",border:"1px solid var(--border)",borderRadius:99,padding:"1px 7px" }}>Expired</span>;
  if (diff <= 7)  return <span style={{ fontSize:10,fontWeight:700,color:"var(--danger)",background:"var(--danger-bg)",border:"1px solid var(--danger-border)",borderRadius:99,padding:"1px 7px" }}>Exp {diff}d</span>;
  if (diff <= 30) return <span style={{ fontSize:10,fontWeight:700,color:"var(--warn)",background:"var(--warn-bg)",border:"1px solid var(--warn-border)",borderRadius:99,padding:"1px 7px" }}>Exp {diff}d</span>;
  return <span style={{ fontSize:10,fontWeight:600,color:"var(--text-4)",background:"var(--bg-alt)",border:"1px solid var(--border)",borderRadius:99,padding:"1px 7px" }}>{fmtDateOnly(expiryDate)}</span>;
}

function CategoryTag({ cat }) {
  if (!cat || cat === "OTHER") return null;
  const c = CAT_COLORS[cat] || "var(--text-3)";
  return <span style={{ fontSize:10,fontWeight:700,color:c,background:c+"18",border:`1px solid ${c}33`,borderRadius:99,padding:"1px 7px" }}>{cat}</span>;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]           = useState("dashboard");
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(false);
  const [file, setFile]         = useState(null);
  const [desc, setDesc]         = useState("");
  const [category, setCategory] = useState("OTHER");
  const [expiryDate, setExpiryDate] = useState("");
  const [uploading, setUploading]   = useState(false);
  const [viewDoc, setViewDoc]   = useState(null);
  const [docTab, setDocTab]     = useState("info");
  const [search, setSearch]     = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [showHash, setShowHash] = useState(false);
  const [qrData, setQrData]     = useState(null);
  const [versions, setVersions] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [verFile, setVerFile]   = useState(null);
  const batchRef = useRef();
  const [trustData, setTrustData]     = useState(null);
  const [bulkFiles, setBulkFiles]     = useState([]);
  const [bulkCat, setBulkCat]         = useState("OTHER");
  const [bulkProgress, setBulkProgress] = useState([]);
  const [bulking, setBulking]         = useState(false);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getMyDocuments(); setDocs(data.data || []); }
    catch { toast.error("Failed to load documents"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);
  useEffect(() => {
    getMyTrustScore().then(r => setTrustData(r.data.data)).catch(() => {});
  }, []);
  useEffect(() => { setShowHash(false); setQrData(null); setVersions([]); setDocTab("info"); setVerFile(null); }, [viewDoc]);

  const loadQR = async id => {
    setQrLoading(true);
    try { const { data } = await getQRCodeBase64(id); setQrData(data); }
    catch { toast.error("QR unavailable"); }
    finally { setQrLoading(false); }
  };

  const loadVersions = async id => {
    try { const { data } = await getDocumentVersions(id); setVersions(data.data || []); }
    catch { toast.error("Could not load versions"); }
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return toast.error("Select a file first");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (desc)       fd.append("description", desc);
      if (category)   fd.append("category", category);
      if (expiryDate) fd.append("expiryDate", expiryDate);
      const { data } = await uploadDocument(fd);
      toast.success("Registered on blockchain ✅");
      setFile(null); setDesc(""); setCategory("OTHER"); setExpiryDate("");
      setDocs(p => [data.data, ...p]); setTab("history");
    } catch (err) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles.length) return toast.error("Add files first");
    setBulking(true);
    setBulkProgress(bulkFiles.map(f => ({ name:f.name, status:"uploading" })));
    try {
      const fd = new FormData();
      bulkFiles.forEach(f => fd.append("files", f));
      fd.append("category", bulkCat);
      const { data } = await batchUploadDocuments(fd);
      const r = data.data;
      setBulkProgress(bulkFiles.map(f => ({
        name:f.name, status: r.documents.find(d => d.originalFileName === f.name) ? "done" : "failed"
      })));
      toast.success(`${r.succeeded}/${r.total} uploaded`);
      loadDocs(); setBulkFiles([]);
    } catch { toast.error("Batch upload failed"); setBulkProgress([]); }
    finally { setBulking(false); }
  };

  const handleNewVersion = async () => {
    if (!verFile || !viewDoc) return;
    try {
      const fd = new FormData(); fd.append("file", verFile); fd.append("description", "New version");
      await uploadNewVersion(viewDoc.id, fd);
      toast.success("New version uploaded");
      loadDocs(); loadVersions(viewDoc.id); setVerFile(null);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this document?")) return;
    try { await deleteDocument(id); setDocs(p => p.filter(d => d.id !== id)); toast.success("Deleted"); setViewDoc(null); }
    catch { toast.error("Delete failed"); }
  };

  const filtered = docs.filter(d =>
    (!search || d.originalFileName?.toLowerCase().includes(search.toLowerCase())) &&
    (filterCat === "ALL" || d.category === filterCat)
  );
  const expiringCount = docs.filter(d => { if (!d.expiryDate) return false; const diff = Math.ceil((new Date(d.expiryDate)-new Date())/86400000); return diff>=0&&diff<=30; }).length;

  return (
    <div className="app-layout">
      <Sidebar active={tab} onNav={setTab} />
      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">{{ dashboard:"Overview", upload:"Upload", history:"My Documents", bulk:"Bulk Upload", profile:"Settings" }[tab]}</div>
            <div className="topbar-sub">{user?.fullName} · User</div>
          </div>
          <div className="topbar-right">
            <ThemeToggle size="sm" />
            {tab !== "bulk" && <button className="btn btn-secondary btn-sm" onClick={() => setTab("bulk")}><Layers size={12} />Bulk</button>}
            {tab !== "upload" && <button className="btn btn-primary btn-sm" onClick={() => setTab("upload")}><Upload size={12} />Upload</button>}
          </div>
        </div>

        <div className="page-body">
          {tab === "profile" && <ProfilePage onBack={() => setTab("dashboard")} />}

          {/* OVERVIEW */}
          {tab === "dashboard" && (
            <>
              <div className="stats-grid">
                {[
                  { label:"Total",    val:docs.length,                                  Icon:FileText,     color:"muted"  },
                  { label:"Verified", val:docs.filter(d=>d.status==="VERIFIED").length, Icon:ShieldCheck,  color:"green"  },
                  { label:"Tampered", val:docs.filter(d=>d.status==="TAMPERED").length, Icon:AlertTriangle,color:"red"    },
                  { label:"Expiring soon", val:expiringCount,                           Icon:Clock,        color:"yellow" },
                ].map(({ label, val, Icon, color }, i) => (
                  <div className="stat-card anim-in" key={label} style={{ animationDelay:`${i*.05}s` }}>
                    <div className="stat-header"><span className="stat-label">{label}</span><div className={`stat-icon ${color}`}><Icon size={14} /></div></div>
                    <div className="stat-value">{val}</div>
                    <div className="stat-desc">documents</div>
                  </div>
                ))}
              </div>
              <div className="grid-2" style={{ alignItems:"start" }}>
                <div className="card anim-in" style={{ animationDelay:".2s" }}>
                  <div className="card-header">
                    <span className="card-title"><FileText size={14} />Recent documents</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab("history")}>View all</button>
                  </div>
                  {docs.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={18} /></div>
                      <div className="empty-title">No documents yet</div>
                      <button className="btn btn-primary btn-sm" onClick={() => setTab("upload")}><Upload size={12} />Upload now</button>
                    </div>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Document</th><th>Category</th><th>Status</th><th>Expiry</th></tr></thead>
                        <tbody>
                          {docs.slice(0,6).map(d => (
                            <tr key={d.id} style={{ cursor:"pointer" }} onClick={() => setViewDoc(d)}>
                              <td>
                                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                  <div style={{ width:26, height:26, background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}><FileEmoji mime={d.contentType} /></div>
                                  <div style={{ fontWeight:600, color:"var(--text-1)", fontSize:12, maxWidth:140, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.originalFileName}</div>
                                </div>
                              </td>
                              <td><CategoryTag cat={d.category} /></td>
                              <td><StatusBadge value={d.status} /></td>
                              <td><ExpiryBadge expiryDate={d.expiryDate} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Trust Score card */}
                {trustData && (
                  <div className="card anim-in" style={{ animationDelay:".28s", gridColumn:"1 / -1" }}>
                    <div className="card-header">
                      <span className="card-title">⭐ My Trust Score</span>
                      <span style={{ fontSize:11.5, color:"var(--text-4)" }}>Based on your document history</span>
                    </div>
                    <div className="card-body" style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                      <TrustScoreGauge score={Number(trustData.trustScore)} />
                      <div style={{ flex:1, minWidth:200 }}>
                        <div style={{ fontSize:18, fontWeight:900, color:"var(--text-1)", marginBottom:3 }}>{trustData.grade}</div>
                        <div style={{ fontSize:13, color:"var(--text-3)", marginBottom:12 }}>{trustData.description}</div>
                        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                          {[["Uploads",trustData.uploads,"var(--text-2)"],["Verified",trustData.verified,"var(--ok)"],["Tampered",trustData.tampered,trustData.tampered>0?"var(--danger)":"var(--text-4)"]].map(([k,v,col]) => (
                            <div key={k} style={{ textAlign:"center" }}>
                              <div style={{ fontSize:20, fontWeight:900, color:col }}>{v}</div>
                              <div style={{ fontSize:11, color:"var(--text-4)", fontWeight:600 }}>{k}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="card anim-in" style={{ animationDelay:".24s" }}>
                  <div className="card-header"><span className="card-title"><Award size={14} />What makes KMS Chain unique</span></div>
                  <div className="card-body">
                    {[
                      { emoji:"🔳", title:"QR Code per document",   desc:"Scan → verify on any device instantly, no app needed" },
                      { emoji:"📋", title:"Version control",         desc:"v1, v2, v3 — full history preserved on the blockchain" },
                      { emoji:"⏰", title:"Expiry tracking",         desc:"Documents auto-expire — perfect for contracts and licences" },
                      { emoji:"🗂",  title:"Document categories",    desc:"Legal, Academic, Financial, Medical and more" },
                      { emoji:"📦", title:"Batch upload",            desc:"Upload 20 files at once — all blockchain-registered" },
                      { emoji:"📜", title:"Verification certificate",desc:"Branded printable proof-of-authenticity document" },
                    ].map(({ emoji, title, desc }) => (
                      <div key={title} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid var(--border)" }}>
                        <span style={{ fontSize:18, flexShrink:0, width:24 }}>{emoji}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-1)", marginBottom:1 }}>{title}</div>
                          <div style={{ fontSize:11.5, color:"var(--text-4)", lineHeight:1.5 }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* UPLOAD */}
          {tab === "upload" && (
            <div style={{ maxWidth:560 }} className="anim-in">
              <div className="card">
                <div className="card-header"><span className="card-title"><Upload size={14} />Upload document</span></div>
                <div className="card-body">
                  <form onSubmit={handleUpload}>
                    <div className="form-group"><label className="form-label">File</label><FileDropZone file={file} onFile={setFile} /></div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Expiry date <span style={{ textTransform:"none", fontWeight:400, color:"var(--text-4)" }}>(optional)</span></label>
                        <input className="form-input" type="date" value={expiryDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={e => setExpiryDate(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description <span style={{ textTransform:"none", fontWeight:400, color:"var(--text-4)" }}>(optional)</span></label>
                      <textarea className="form-textarea" rows={2} placeholder="Brief description…" value={desc} onChange={e => setDesc(e.target.value)} />
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-primary btn-lg" type="submit" disabled={uploading||!file} style={{ flex:1, justifyContent:"center" }}>
                        {uploading ? <><div className="spinner-sm" />Registering…</> : <><Upload size={14} />Register on blockchain</>}
                      </button>
                      <button className="btn btn-secondary btn-lg" type="button" onClick={() => { setFile(null); setDesc(""); setCategory("OTHER"); setExpiryDate(""); }}>Clear</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* BULK UPLOAD */}
          {tab === "bulk" && (
            <div style={{ maxWidth:620 }} className="anim-in">
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><Layers size={14} />Bulk upload</span>
                  <span style={{ fontSize:11.5, color:"var(--text-4)" }}>Up to 20 files at once</span>
                </div>
                <div className="card-body">
                  <div className="info-strip info" style={{ marginBottom:14 }}>
                    <Layers className="info-strip-icon" />
                    <div className="info-strip-text">Each file is individually hashed and registered on the blockchain. Results shown per file.</div>
                  </div>
                  <div
                    style={{ border:"1.5px dashed var(--border-2)", borderRadius:"var(--radius)", padding:"24px 20px", textAlign:"center", cursor:"pointer", background:"var(--bg-alt)", marginBottom:14, transition:"all .15s" }}
                    onClick={() => batchRef.current.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = "var(--border-2)"; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--border-2)"; setBulkFiles(p => [...p, ...Array.from(e.dataTransfer.files)].slice(0,20)); }}>
                    <input ref={batchRef} type="file" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt" onChange={e => setBulkFiles(p => [...p, ...Array.from(e.target.files)].slice(0,20))} />
                    <Layers size={28} style={{ color:"var(--text-3)", marginBottom:9 }} />
                    <div style={{ fontSize:13, color:"var(--text-3)" }}>Drag & drop or <strong style={{ color:"var(--accent)", cursor:"pointer" }}>browse</strong> multiple files</div>
                    <div style={{ fontSize:11.5, color:"var(--text-4)", marginTop:3 }}>Up to 20 files · PDF, JPG, PNG, DOC, TXT</div>
                  </div>
                  {bulkFiles.length > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:"var(--text-2)" }}>{bulkFiles.length} file{bulkFiles.length>1?"s":""}</span>
                        <button onClick={() => { setBulkFiles([]); setBulkProgress([]); }} style={{ fontSize:11.5, color:"var(--danger)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Clear all</button>
                      </div>
                      <div style={{ maxHeight:180, overflowY:"auto", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                        {bulkFiles.map((f, i) => {
                          const p = bulkProgress[i];
                          return (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"7px 12px", borderBottom:"1px solid var(--border)", fontSize:12 }}>
                              <span style={{ fontSize:14 }}>{f.type.includes("pdf")?"📕":f.type.includes("image")?"🖼":"📄"}</span>
                              <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--text-1)" }}>{f.name}</span>
                              {p ? (
                                <span style={{ fontSize:11, fontWeight:700, color:p.status==="done"?"var(--ok)":p.status==="failed"?"var(--danger)":"var(--warn)" }}>
                                  {p.status==="done"?"✅ Done":p.status==="failed"?"❌ Failed":"⏳"}
                                </span>
                              ) : (
                                <button onClick={() => setBulkFiles(p => p.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-4)", padding:2 }}><X size={12} /></button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Category for all files</label>
                    <select className="form-select" value={bulkCat} onChange={e => setBulkCat(e.target.value)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-primary btn-lg btn-block" style={{ justifyContent:"center" }}
                    disabled={!bulkFiles.length || bulking} onClick={handleBulkUpload}>
                    {bulking ? <><div className="spinner-sm" />Uploading {bulkFiles.length} files…</> : <><Layers size={14} />Upload {bulkFiles.length||""} file{bulkFiles.length!==1?"s":""} to blockchain</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div className="card anim-in">
              <div className="table-toolbar">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span style={{ font:"700 13.5px Inter", color:"var(--text-1)" }}>Documents</span>
                  <span className="tag">{filtered.length}/{docs.length}</span>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <select style={{ padding:"5px 9px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--text-2)", outline:"none", cursor:"pointer" }}
                    value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="ALL">All categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                  </select>
                  <div className="search-box">
                    <FileText className="search-box-icon" />
                    <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="table-wrap">
                {loading ? <div className="empty-state"><div className="spinner" /></div>
                  : filtered.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={18} /></div>
                      <div className="empty-title">{search || filterCat !== "ALL" ? "No results" : "No documents"}</div>
                    </div>
                  ) : (
                    <table>
                      <thead><tr><th>Document</th><th>Category</th><th>Status</th><th>Version</th><th>Expiry</th><th>Registered</th><th></th></tr></thead>
                      <tbody>
                        {filtered.map(d => (
                          <tr key={d.id}>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                                <div style={{ width:28, height:28, background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}><FileEmoji mime={d.contentType} /></div>
                                <div>
                                  <div style={{ fontWeight:600, color:"var(--text-1)", maxWidth:190, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:12.5 }}>{d.originalFileName}</div>
                                  {d.description && <div style={{ fontSize:11, color:"var(--text-4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:190 }}>{d.description}</div>}
                                </div>
                              </div>
                            </td>
                            <td><CategoryTag cat={d.category} /></td>
                            <td><StatusBadge value={d.status} /></td>
                            <td><span style={{ fontSize:11, fontWeight:700, color:"var(--text-3)" }}>v{d.versionNumber}</span></td>
                            <td><ExpiryBadge expiryDate={d.expiryDate} /></td>
                            <td style={{ fontSize:11.5, color:"var(--text-4)", whiteSpace:"nowrap" }}>{fmtDate(d.uploadedAt)}</td>
                            <td>
                              <div style={{ display:"flex", gap:4 }}>
                                <button className="btn btn-secondary btn-sm btn-icon" title="Details" onClick={() => setViewDoc(d)}><Eye size={12} /></button>
                                <button className="btn btn-secondary btn-sm btn-icon" title="QR Code" onClick={() => { setViewDoc(d); setDocTab("qr"); loadQR(d.id); }}><QrCode size={12} /></button>
                                <button className="btn btn-secondary btn-sm btn-icon" title="Certificate" onClick={() => navigate(`/certificate/${d.id}`)}><Award size={12} /></button>
                                <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => handleDelete(d.id)}><Trash2 size={12} /></button>
                              </div>
                            </td>
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

      {/* DOCUMENT DETAIL MODAL */}
      {viewDoc && (
        <div className="modal-overlay" onClick={() => setViewDoc(null)}>
          <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:18 }}><FileEmoji mime={viewDoc.contentType} /></span>
                <div>
                  <div className="modal-title" style={{ maxWidth:280, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{viewDoc.originalFileName}</div>
                  <div style={{ display:"flex", gap:5, marginTop:3, flexWrap:"wrap" }}>
                    <StatusBadge value={viewDoc.status} />
                    <CategoryTag cat={viewDoc.category} />
                    <ExpiryBadge expiryDate={viewDoc.expiryDate} />
                    <span className="tag">v{viewDoc.versionNumber}</span>
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setViewDoc(null)}><X size={13} /></button>
            </div>

            {/* Tab bar */}
            <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--bg-alt)" }}>
              {[
                { key:"info",     Icon:FileText,  label:"Details"   },
                { key:"qr",       Icon:QrCode,    label:"QR Code"   },
                { key:"versions", Icon:GitBranch, label:"Versions"  },
                { key:"timeline", Icon:History,   label:"Timeline"  },
              ].map(({ key, Icon, label }) => (
                <button key={key}
                  onClick={() => {
                    setDocTab(key);
                    if (key === "qr" && !qrData) loadQR(viewDoc.id);
                    if (key === "versions") loadVersions(viewDoc.id);
                  }}
                  style={{ flex:1, padding:"9px 6px", border:"none", cursor:"pointer", background:docTab===key?"var(--surface)":"transparent", borderBottom:`2px solid ${docTab===key?"var(--text-1)":"transparent"}`, fontSize:11, fontWeight:700, color:docTab===key?"var(--text-1)":"var(--text-3)", display:"flex", alignItems:"center", justifyContent:"center", gap:5, transition:".12s", fontFamily:"inherit" }}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>

            <div className="modal-body" style={{ maxHeight:420, overflowY:"auto" }}>
              {/* DETAILS TAB */}
              {docTab === "info" && (
                <>
                  {[
                    ["File size",    viewDoc.fileSize],
                    ["Uploaded by",  viewDoc.uploadedBy],
                    ["Registered",   fmtDate(viewDoc.uploadedAt)],
                    ["Last verified",fmtDate(viewDoc.lastVerifiedAt)],
                    ["Verifications",`${viewDoc.verificationCount} ✅  ${viewDoc.tamperAttempts} ❌`],
                    ["Description",  viewDoc.description || "—"],
                  ].map(([k,v]) => (
                    <div key={k} className="detail-row">
                      <span className="detail-key">{k}</span>
                      <span className="detail-value">{v}</span>
                    </div>
                  ))}
                  <div style={{ marginTop:12, padding:"11px 13px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12, color:"var(--text-3)" }}>
                    <strong>Blockchain: </strong>
                    {viewDoc.status==="VERIFIED" && "✅ Authentic — matches blockchain record"}
                    {viewDoc.status==="TAMPERED" && "❌ Tampered — does not match blockchain"}
                    {viewDoc.status==="PENDING"  && "⏳ Pending — awaiting verification"}
                    {viewDoc.status==="EXPIRED"  && "⌛ Expired — validity period ended"}
                  </div>
                  <button onClick={() => setShowHash(p=>!p)} style={{ width:"100%", marginTop:9, padding:"7px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:11.5, fontWeight:600, color:"var(--text-3)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", fontFamily:"inherit" }}>
                    <span>Technical details (hashes)</span><span>{showHash?"▲":"▼"}</span>
                  </button>
                  {showHash && (
                    <div style={{ marginTop:7, padding:"11px 13px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                      <div style={{ marginBottom:9 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>SHA-256 Hash</div>
                        <div style={{ display:"flex", gap:7 }}>
                          <div style={{ fontFamily:"ui-monospace,monospace", fontSize:10, color:"var(--text-2)", wordBreak:"break-all", flex:1 }}>{viewDoc.sha256Hash}</div>
                          <button className="btn btn-secondary btn-sm" style={{ flexShrink:0, padding:"3px 7px" }} onClick={() => { navigator.clipboard.writeText(viewDoc.sha256Hash); toast.success("Copied"); }}><Copy size={11} /></button>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, fontWeight:700, color:"var(--text-4)", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Blockchain TX ID</div>
                        <div style={{ fontFamily:"ui-monospace,monospace", fontSize:10, color:"var(--text-2)", wordBreak:"break-all" }}>{viewDoc.blockchainTxId}</div>
                      </div>
                    </div>
                  )}
                  {/* Upload new version */}
                  <div style={{ marginTop:11, padding:"11px 13px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--text-2)", marginBottom:7, display:"flex", alignItems:"center", gap:5 }}>
                      <GitBranch size={12} />Upload new version (v{(viewDoc.versionNumber||1)+1})
                    </div>
                    <FileDropZone file={verFile} onFile={setVerFile} />
                    {verFile && <button className="btn btn-primary btn-sm" style={{ marginTop:7, width:"100%", justifyContent:"center" }} onClick={handleNewVersion}><GitBranch size={12} />Upload as v{(viewDoc.versionNumber||1)+1}</button>}
                  </div>
                </>
              )}

              {/* QR CODE TAB */}
              {docTab === "qr" && (
                <div style={{ textAlign:"center", padding:"18px 0" }}>
                  {qrLoading ? <div style={{ padding:40 }}><div className="spinner" style={{ margin:"0 auto" }} /></div>
                    : qrData ? (
                      <>
                        <div style={{ display:"inline-block", padding:12, background:"var(--surface)", border:"2px solid var(--border)", borderRadius:12, marginBottom:14 }}>
                          <img src={qrData.qrCode} alt="QR Code" style={{ width:180, height:180, display:"block" }} />
                        </div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text-1)", marginBottom:5 }}>Scan to verify instantly</div>
                        <div style={{ fontSize:12, color:"var(--text-4)", marginBottom:14, lineHeight:1.6 }}>Anyone can scan this QR code to instantly verify this document — no account required.</div>
                        <div style={{ fontFamily:"ui-monospace,monospace", fontSize:9.5, color:"var(--text-4)", background:"var(--bg-alt)", padding:"7px 12px", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", wordBreak:"break-all", marginBottom:12 }}>{qrData.verifyUrl}</div>
                        <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                          <button className="btn btn-primary btn-sm" onClick={() => { const a=document.createElement("a"); a.href=qrData.qrCode; a.download=`qr-${viewDoc.id}.png`; a.click(); }}><Download size={12} />Download QR</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(qrData.verifyUrl); toast.success("Verify link copied"); }}><Copy size={12} />Copy link</button>
                        </div>
                      </>
                    ) : <div style={{ color:"var(--text-4)", fontSize:13 }}>QR code unavailable — connect backend</div>}
                </div>
              )}

              {/* VERSIONS TAB */}
              {docTab === "versions" && (
                <div>
                  {versions.length <= 1 ? (
                    <div className="empty-state" style={{ padding:"28px 0" }}>
                      <div className="empty-icon"><GitBranch size={18} /></div>
                      <div className="empty-title">Only one version</div>
                      <div className="empty-desc">Upload a new version from Details tab</div>
                    </div>
                  ) : versions.map((v, i) => (
                    <div key={v.id} style={{ display:"flex", gap:12, padding:"11px 0", borderBottom:"1px solid var(--border)" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                        <div style={{ width:26, height:26, borderRadius:"50%", background:v.id===viewDoc.id?"var(--text-1)":"var(--bg-alt)", border:`2px solid ${v.id===viewDoc.id?"var(--text-1)":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:v.id===viewDoc.id?"var(--surface)":"var(--text-3)" }}>v{v.versionNumber}</div>
                        {i < versions.length-1 && <div style={{ width:2, height:20, background:"var(--border)", marginTop:3 }} />}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3 }}>
                          <span style={{ fontSize:12.5, fontWeight:700, color:"var(--text-1)" }}>Version {v.versionNumber}</span>
                          {v.id===viewDoc.id && <span style={{ fontSize:10, fontWeight:700, color:"var(--accent)", background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:99, padding:"1px 6px" }}>Current</span>}
                          <StatusBadge value={v.status} />
                        </div>
                        <div style={{ fontSize:11.5, color:"var(--text-4)" }}>{fmtDate(v.uploadedAt)}</div>
                        {v.description && <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:2 }}>{v.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TIMELINE TAB */}
              {docTab === "timeline" && (() => {
                const events = [
                  { icon:"📤", event:"Registered on blockchain", date:viewDoc.uploadedAt, color:"var(--accent)", desc:`Uploaded by ${viewDoc.uploadedBy}` },
                  ...(viewDoc.lastVerifiedAt ? [{ icon:viewDoc.status==="VERIFIED"?"✅":"❌", event:viewDoc.status==="VERIFIED"?"Verified — authentic":"Tamper attempt detected", date:viewDoc.lastVerifiedAt, color:viewDoc.status==="VERIFIED"?"var(--ok)":"var(--danger)", desc:`${viewDoc.verificationCount} verif, ${viewDoc.tamperAttempts} tamper attempt(s)` }] : []),
                  ...(viewDoc.expiryDate ? [{ icon:"⌛", event:new Date(viewDoc.expiryDate)<new Date()?"Expired":"Scheduled expiry", date:viewDoc.expiryDate+"T00:00:00", color:new Date(viewDoc.expiryDate)<new Date()?"var(--text-4)":"var(--warn)", desc:"Document expiry date" }] : []),
                ];
                return (
                  <div style={{ paddingTop:4 }}>
                    {events.map(({ icon, event, date, color, desc }, i) => (
                      <div key={i} style={{ display:"flex", gap:12, paddingBottom:i<events.length-1?14:0, marginBottom:i<events.length-1?14:0, borderBottom:i<events.length-1?"1px solid var(--border)":"none" }}>
                        <div style={{ width:30, height:30, borderRadius:"50%", background:"var(--bg-alt)", border:"2px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{icon}</div>
                        <div>
                          <div style={{ fontSize:12.5, fontWeight:700, color, marginBottom:2 }}>{event}</div>
                          <div style={{ fontSize:11.5, color:"var(--text-4)" }}>{fmtDate(date)}</div>
                          <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:2 }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/certificate/${viewDoc.id}`)} style={{ gap:5 }}><Award size={12} />Certificate</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/verify?hash=${viewDoc.sha256Hash}`); toast.success("Verify link copied"); }}><ExternalLink size={12} />Share</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(viewDoc.id)}><Trash2 size={12} />Delete</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewDoc(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
