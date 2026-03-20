import { Link } from "react-router-dom";
import { Link2, ArrowLeft } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function NotFound() {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Inter,system-ui,sans-serif", padding:"32px 20px" }}>
      <div style={{ position:"fixed", top:16, right:16 }}><ThemeToggle /></div>
      <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:48 }}>
        <div style={{ width:26, height:26, background:"var(--text-1)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--surface)" }}><Link2 size={13} /></div>
        <span style={{ fontSize:14, fontWeight:800, color:"var(--text-1)" }}>KMS Chain</span>
      </div>
      <div style={{ textAlign:"center", maxWidth:360 }}>
        <div style={{ fontSize:72, fontWeight:900, color:"var(--border-2)", letterSpacing:"-4px", lineHeight:1, marginBottom:18 }}>404</div>
        <h1 style={{ fontSize:21, fontWeight:800, color:"var(--text-1)", letterSpacing:"-.3px", marginBottom:9 }}>Page not found</h1>
        <p style={{ fontSize:13.5, color:"var(--text-3)", lineHeight:1.65, marginBottom:28 }}>The page you're looking for doesn't exist or has been moved.</p>
        <div style={{ display:"flex", gap:9, justifyContent:"center" }}>
          <Link to="/"><button style={{ padding:"8px 16px", background:"var(--text-1)", color:"var(--surface)", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}><ArrowLeft size={13} />Go home</button></Link>
          <Link to="/verify"><button style={{ padding:"8px 14px", background:"var(--surface)", color:"var(--text-1)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Verify document</button></Link>
        </div>
      </div>
    </div>
  );
}
