import { useState, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ShieldCheck, Link2, AlertTriangle, Printer, Download, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { getCertificateData } from "../api/services";
import API from "../api/axios";

const fmt = d => d ? new Date(d).toLocaleString("en-US", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit", timeZoneName:"short" }) : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) : "—";

export default function Certificate() {
  const { id }  = useParams();
  const [cert, setCert] = useState(null);
  const [qr,   setQr]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [cr, qrr] = await Promise.all([
          getCertificateData(id),
          API.get(`/api/qr/${id}/base64`),
        ]);
        setCert(cr.data.data);
        setQr(qrr.data.qrCode);
      } catch (e) {
        setError("Certificate not found or document does not exist.");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid #e2e8f0", borderTopColor:"#2563eb", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 14px" }} />
        <div style={{ fontSize:13, color:"#64748b" }}>Loading certificate…</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f8fafc", fontFamily:"Inter,system-ui,sans-serif" }}>
      <AlertTriangle size={40} color="#dc2626" style={{ marginBottom:16 }} />
      <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginBottom:8 }}>Certificate Unavailable</div>
      <div style={{ fontSize:13, color:"#64748b", marginBottom:20 }}>{error}</div>
      <Link to="/verify" style={{ padding:"8px 18px", background:"#0f172a", color:"#fff", borderRadius:7, fontSize:13, fontWeight:700 }}>Verify a document</Link>
    </div>
  );

  const isVerified = cert.status === "VERIFIED";
  const isTampered = cert.status === "TAMPERED";
  const isExpired  = cert.status === "EXPIRED";

  const statusConfig = {
    VERIFIED:  { icon:"✅", label:"VERIFIED — AUTHENTIC", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
    TAMPERED:  { icon:"❌", label:"TAMPERED — INVALID",   color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
    PENDING:   { icon:"⏳", label:"PENDING VERIFICATION", color:"#ca8a04", bg:"#fefce8", border:"#fef08a" },
    EXPIRED:   { icon:"⌛", label:"EXPIRED",              color:"#64748b", bg:"#f8fafc", border:"#e2e8f0" },
  };
  const sc = statusConfig[cert.status] || statusConfig.PENDING;

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"Inter,system-ui,sans-serif", padding:"32px 20px" }}>
      {/* Toolbar (hidden when printing) */}
      <div className="no-print" style={{ maxWidth:820, margin:"0 auto 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Link to="/" style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#64748b", fontWeight:600 }}>
          <Link2 size={14} /> KMS Chain
        </Link>
        <div style={{ display:"flex", gap:9 }}>
          <button onClick={() => window.print()} style={{ padding:"7px 14px", background:"#0f172a", color:"#fff", border:"none", borderRadius:7, fontSize:12.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <Printer size={13} /> Print
          </button>
          <Link to={`/verify?hash=${cert.sha256Hash}`}>
            <button style={{ padding:"7px 14px", background:"#fff", color:"#0f172a", border:"1px solid #e2e8f0", borderRadius:7, fontSize:12.5, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <ExternalLink size={13} /> Verify again
            </button>
          </Link>
        </div>
      </div>

      {/* Certificate Card */}
      <div style={{ maxWidth:820, margin:"0 auto", background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,.1)", overflow:"hidden" }}>

        {/* Header band */}
        <div style={{ background: isVerified ? "linear-gradient(135deg,#0f172a,#1e3a5f)" : isTampered ? "linear-gradient(135deg,#7f1d1d,#991b1b)" : "linear-gradient(135deg,#0f172a,#1e293b)", padding:"36px 44px 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, background:"rgba(255,255,255,.12)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Link2 size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:"-.3px" }}>KMS Chain</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", letterSpacing:".06em", textTransform:"uppercase" }}>Blockchain Document Verification</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", letterSpacing:".07em", textTransform:"uppercase", marginBottom:4 }}>Certificate ID</div>
              <div style={{ fontFamily:"ui-monospace,monospace", fontSize:11, color:"rgba(255,255,255,.7)" }}>KMS-CERT-{String(cert.documentId).padStart(6,"0")}</div>
            </div>
          </div>
          <div style={{ marginTop:28, borderTop:"1px solid rgba(255,255,255,.12)", paddingTop:24, textAlign:"center" }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.45)", letterSpacing:".1em", textTransform:"uppercase", marginBottom:8 }}>Certificate of Document Verification</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#fff", letterSpacing:"-.4px", lineHeight:1.2 }}>{cert.documentName}</div>
          </div>
        </div>

        {/* Status banner */}
        <div style={{ padding:"20px 44px", background:sc.bg, borderBottom:`1px solid ${sc.border}`, display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
          <span style={{ fontSize:28 }}>{sc.icon}</span>
          <div>
            <div style={{ fontSize:16, fontWeight:900, color:sc.color, letterSpacing:"1px", textTransform:"uppercase" }}>{sc.label}</div>
            <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>
              {isVerified && "This document is authentic and matches the blockchain record."}
              {isTampered && "This document does not match the blockchain record — tampering detected."}
              {cert.status === "PENDING" && "This document has been registered but not yet verified."}
              {isExpired  && "This document's verification period has expired."}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ padding:"32px 44px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 180px", gap:32 }}>

            {/* Details */}
            <div>
              <div style={{ fontSize:11, fontWeight:800, color:"#64748b", letterSpacing:".08em", textTransform:"uppercase", marginBottom:16 }}>Document Details</div>

              {[
                ["Document Name",    cert.documentName],
                ["Category",         cert.category?.charAt(0) + cert.category?.slice(1).toLowerCase()],
                ["Registered by",    cert.uploadedBy],
                ["Registered on",    fmt(cert.uploadedAt)],
                ["Last Verified",    cert.lastVerifiedAt ? fmt(cert.lastVerifiedAt) : "Not yet verified"],
                ["Verification Count", cert.verificationCount + " time(s)"],
                ["Expiry Date",      cert.expiryDate ? fmtDate(cert.expiryDate) : "No expiry set"],
              ].map(([k, v]) => (
                <div key={k} style={{ display:"grid", gridTemplateColumns:"160px 1fr", padding:"9px 0", borderBottom:"1px solid #f1f5f9", fontSize:13 }}>
                  <span style={{ fontWeight:700, color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:".04em", paddingTop:1 }}>{k}</span>
                  <span style={{ color:"#0f172a", fontWeight:500 }}>{v}</span>
                </div>
              ))}

              {/* Blockchain integrity */}
              <div style={{ marginTop:20, padding:"14px 16px", background: cert.chainValid ? "#f0fdf4" : "#fef2f2", border:`1px solid ${cert.chainValid ? "#bbf7d0" : "#fecaca"}`, borderRadius:9 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  {cert.chainValid
                    ? <CheckCircle2 size={14} color="#16a34a" />
                    : <AlertTriangle size={14} color="#dc2626" />}
                  <span style={{ fontSize:12, fontWeight:800, color: cert.chainValid ? "#16a34a" : "#dc2626", textTransform:"uppercase", letterSpacing:".05em" }}>
                    {cert.chainValid ? "Blockchain Integrity Confirmed" : "Blockchain Integrity Compromised"}
                  </span>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>SHA-256 Hash</div>
                  <div style={{ fontFamily:"ui-monospace,monospace", fontSize:10, color:"#334155", wordBreak:"break-all", background:"#fff", padding:"6px 10px", borderRadius:6, border:"1px solid #e2e8f0" }}>{cert.sha256Hash}</div>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:4 }}>Blockchain TX ID</div>
                  <div style={{ fontFamily:"ui-monospace,monospace", fontSize:10, color:"#334155", wordBreak:"break-all", background:"#fff", padding:"6px 10px", borderRadius:6, border:"1px solid #e2e8f0" }}>{cert.blockchainTxId}</div>
                </div>
              </div>
            </div>

            {/* QR code */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
              {qr ? (
                <div style={{ background:"#fff", padding:10, border:"1px solid #e2e8f0", borderRadius:10, marginBottom:10 }}>
                  <img src={qr} alt="Verification QR Code" style={{ width:160, height:160 }} />
                </div>
              ) : (
                <div style={{ width:160, height:160, background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>QR unavailable</span>
                </div>
              )}
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#64748b", letterSpacing:".06em", textTransform:"uppercase", marginBottom:3 }}>Scan to Verify</div>
                <div style={{ fontSize:10, color:"#94a3b8", lineHeight:1.5 }}>Scan this QR code to instantly verify this document on any device</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"18px 44px", background:"#f8fafc", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:11, color:"#94a3b8" }}>
            This certificate was generated by KMS Chain Blockchain Verification System.
          </div>
          <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"ui-monospace,monospace" }}>
            {new Date().toISOString().split("T")[0]}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
