import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Link2, ShieldCheck, Hash, Search, CheckCircle2, AlertTriangle, Upload } from "lucide-react";
import FileDropZone from "../components/FileDropZone";
import ThemeToggle from "../components/ThemeToggle";
import API from "../api/axios";

const fmtDate = d => d ? new Date(d).toLocaleString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";

export default function PublicVerify() {
  const [searchParams] = useSearchParams();
  const [tab, setTab]       = useState(searchParams.get("hash") ? "hash" : "file");
  const [hashInput, setHashInput] = useState(searchParams.get("hash") || "");
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setResult(null); setHashInput(""); setFile(null); };

  const checkFile = async () => {
    if (!file) return toast.error("Select a file first");
    setLoading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const { data } = await API.post("/api/public/verify/file", fd, { headers:{"Content-Type":"multipart/form-data"} });
      setResult(data.data);
    } catch (err) { if (err.response?.status === 404) setResult({ found:false }); else toast.error("Service unavailable"); }
    finally { setLoading(false); }
  };

  const checkHash = async () => {
    if (!hashInput.trim()) return toast.error("Enter a hash");
    setLoading(true);
    try {
      const { data } = await API.get(`/api/public/verify/hash?hash=${hashInput.trim()}`);
      setResult(data.data);
    } catch (err) { if (err.response?.status === 404) setResult({ found:false }); else toast.error("Service unavailable"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"Inter,system-ui,sans-serif", color:"var(--text-1)", transition:"background .2s,color .2s" }}>
      <nav style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"0 6%", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:26, height:26, background:"var(--text-1)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--surface)" }}><Link2 size={13} /></div>
          <div>
            <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)" }}>KMS Chain</div>
            <div style={{ fontSize:9.5, color:"var(--text-4)" }}>Public Verification Portal</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <ThemeToggle size="sm" />
          <Link to="/login"><button style={{ padding:"5px 11px", background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer" }}>Sign in</button></Link>
          <Link to="/register"><button style={{ padding:"5px 11px", background:"var(--text-1)", border:"none", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:700, color:"var(--surface)", cursor:"pointer" }}>Get started</button></Link>
        </div>
      </nav>

      <div style={{ padding:"60px 6% 80px", textAlign:"center", maxWidth:600, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:99, fontSize:11.5, fontWeight:700, color:"var(--accent)", marginBottom:22 }}>
          <ShieldCheck size={11} /> Free · No account required
        </div>
        <h1 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, color:"var(--text-1)", letterSpacing:"-1px", lineHeight:1.15, marginBottom:14 }}>Verify document authenticity</h1>
        <p style={{ fontSize:14.5, color:"var(--text-3)", lineHeight:1.68, marginBottom:36 }}>Check if any document is authentic by comparing its hash against blockchain records.</p>

        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", overflow:"hidden", boxShadow:"var(--shadow-md)", maxWidth:500, margin:"0 auto" }}>
          <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--bg-alt)" }}>
            {[{ key:"file", I:Upload, label:"Upload file" },{ key:"hash", I:Hash, label:"Paste hash" }].map(({ key, I, label }) => (
              <button key={key} onClick={() => { setTab(key); reset(); }} style={{ flex:1, padding:"11px 14px", border:"none", cursor:"pointer", background:tab===key?"var(--surface)":"transparent", borderBottom:`2px solid ${tab===key?"var(--text-1)":"transparent"}`, fontSize:12.5, fontWeight:700, color:tab===key?"var(--text-1)":"var(--text-3)", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:".12s", fontFamily:"inherit" }}>
                <I size={13} />{label}
              </button>
            ))}
          </div>

          <div style={{ padding:22 }}>
            {!result ? (
              <>
                {tab==="file" && (
                  <>
                    <p style={{ fontSize:12.5, color:"var(--text-3)", marginBottom:12, lineHeight:1.6 }}>Upload the document. Only its hash is sent — the file never leaves your browser.</p>
                    <FileDropZone file={file} onFile={setFile} />
                    <button onClick={checkFile} disabled={loading||!file} style={{ marginTop:12, width:"100%", padding:"10px", background:"var(--text-1)", color:"var(--surface)", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, opacity:(!file||loading)?.5:1, fontFamily:"inherit" }}>
                      {loading?"Verifying…":<><ShieldCheck size={14} />Verify document</>}
                    </button>
                  </>
                )}
                {tab==="hash" && (
                  <>
                    <p style={{ fontSize:12.5, color:"var(--text-3)", marginBottom:12 }}>Paste the SHA-256 hash to look up in the blockchain.</p>
                    <div style={{ marginBottom:12 }}>
                      <input style={{ width:"100%", padding:"9px 12px", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, color:"var(--text-1)", fontFamily:"ui-monospace,monospace", outline:"none", background:"var(--bg-alt)" }}
                        placeholder="e.g. a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5…"
                        value={hashInput} onChange={e => setHashInput(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && checkHash()} />
                    </div>
                    <button onClick={checkHash} disabled={loading||!hashInput.trim()} style={{ width:"100%", padding:"10px", background:"var(--text-1)", color:"var(--surface)", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, opacity:(!hashInput.trim()||loading)?.5:1, fontFamily:"inherit" }}>
                      {loading?"Searching…":<><Search size={14} />Look up hash</>}
                    </button>
                  </>
                )}
              </>
            ) : result.found===false ? (
              <div style={{ textAlign:"center", padding:"10px 0" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>❓</div>
                <div style={{ fontSize:16, fontWeight:800, color:"var(--text-2)", marginBottom:6 }}>Not found on blockchain</div>
                <div style={{ fontSize:13, color:"var(--text-4)", marginBottom:18, lineHeight:1.65 }}>This document was not found. It may not have been registered, or may have been modified.</div>
                <button onClick={reset} style={{ padding:"7px 16px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer", fontFamily:"inherit" }}>Try another</button>
              </div>
            ) : result.verified ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:48, height:48, background:"var(--ok-bg)", border:"2px solid var(--ok-border)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><CheckCircle2 size={22} color="var(--ok)" /></div>
                <div style={{ fontSize:17, fontWeight:900, color:"var(--ok)", marginBottom:5 }}>Document Verified</div>
                <div style={{ fontSize:12.5, color:"var(--text-3)", marginBottom:16, lineHeight:1.6 }}>This document is authentic and matches the blockchain record.</div>
                <div style={{ background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"12px 14px", textAlign:"left", marginBottom:14 }}>
                  {[["Document", result.originalFileName||"—"],["Uploaded by", result.uploadedBy||"—"],["Registered", fmtDate(result.uploadedAt)]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border)", fontSize:12.5 }}>
                      <span style={{ color:"var(--text-3)", fontWeight:600 }}>{k}</span>
                      <span style={{ color:"var(--text-1)", fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <button onClick={reset} style={{ padding:"7px 16px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer", fontFamily:"inherit" }}>Verify another</button>
              </div>
            ) : (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:48, height:48, background:"var(--danger-bg)", border:"2px solid var(--danger-border)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}><AlertTriangle size={22} color="var(--danger)" /></div>
                <div style={{ fontSize:17, fontWeight:900, color:"var(--danger)", marginBottom:5 }}>Document Tampered</div>
                <div style={{ fontSize:12.5, color:"var(--text-3)", marginBottom:18, lineHeight:1.6 }}>This document does not match the blockchain record. It may have been modified.</div>
                <button onClick={reset} style={{ padding:"7px 16px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer", fontFamily:"inherit" }}>Try another</button>
              </div>
            )}
          </div>
        </div>
        <p style={{ marginTop:18, fontSize:12, color:"var(--text-4)" }}>Want to register documents? <Link to="/register" style={{ color:"var(--text-2)", fontWeight:700 }}>Create account →</Link></p>
      </div>
    </div>
  );
}
