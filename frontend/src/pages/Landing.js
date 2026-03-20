import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import {
  Link2, ShieldCheck, FileText, Users, BarChart3,
  ArrowRight, Lock, Hash, Globe, CheckCircle2, Zap, Award, Eye
} from "lucide-react";

const features = [
  { icon: Hash,        title:"SHA-256 Hashing",     desc:"Every document gets a cryptographic fingerprint using the same standard as Bitcoin. Even a 1-byte change is detected." },
  { icon: Link2,       title:"Blockchain Anchoring", desc:"Hashes are mined into an immutable blockchain ledger. Once written, no one can alter or delete the record." },
  { icon: ShieldCheck, title:"Tamper Detection",     desc:"Upload any document at any time. If it's been modified — even metadata — verification instantly fails." },
  { icon: Users,       title:"Role-Based Access",    desc:"Separate roles for Users, Verifiers, and Admins. Every action is logged in a permanent audit trail." },
  { icon: Globe,       title:"Public Portal",        desc:"Share a document hash with anyone. They can verify authenticity on our public portal with no account needed." },
  { icon: Eye,         title:"Full Audit Trail",     desc:"Every upload, verification, login, and admin action is recorded permanently for compliance and accountability." },
];

const team = [
  { name:"Azhar Khan",         role:"Backend Developer & Team Lead", emoji:"🧑‍💻", color:"var(--accent)",  bg:"var(--accent-bg)",  border:"var(--accent-border)",  desc:"Spring Boot architecture, JWT security, blockchain engine, REST APIs" },
  { name:"Arpan Patel",        role:"Database Design",               emoji:"🗄",  color:"var(--ok)",     bg:"var(--ok-bg)",      border:"var(--ok-border)",      desc:"MySQL schema design, entity relationships, query optimization, data integrity" },
  { name:"Aviraj Singh Tomar", role:"Frontend Developer",            emoji:"🎨",  color:"var(--purple)", bg:"var(--purple-bg)",  border:"var(--purple-border)",  desc:"React UI, design system, dashboards, user experience, responsiveness" },
];

const stats = [
  { value:"SHA-256", label:"Hash algorithm"       },
  { value:"3",       label:"Permission levels"    },
  { value:"100%",    label:"Tamper detection"     },
  { value:"∞",       label:"Blockchain permanence"},
];

export default function Landing() {
  const { isDark } = useTheme();

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'Inter',system-ui,sans-serif", color:"var(--text-1)", transition:"background .2s,color .2s" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position:"sticky", top:0, zIndex:50,
        background: isDark ? "rgba(9,9,11,.92)" : "rgba(255,255,255,.92)",
        backdropFilter:"blur(14px)",
        borderBottom:"1px solid var(--border)",
        padding:"0 6%", height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        transition:"background .2s",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, background:"var(--text-1)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--surface)", flexShrink:0 }}>
            <Link2 size={14} />
          </div>
          <span style={{ fontSize:14.5, fontWeight:900, color:"var(--text-1)", letterSpacing:"-.3px" }}>KMS Chain</span>
        </div>

        {/* Nav links */}
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          {[["Home","#hero"],["Features","#features"],["How it Works","#how"],["Team","#team"],["Contact","#contact"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              padding:"6px 12px", borderRadius:"var(--radius-sm)",
              fontSize:13, fontWeight:500, color:"var(--text-3)",
              transition:".12s", display:"none",
            }}
              className="nav-link-hide"
              onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--text-3)"}>
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <ThemeToggle size="sm" />
          <Link to="/verify">
            <button style={{ padding:"6px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer", transition:".12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-alt)"; e.currentTarget.style.borderColor = "var(--border-2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; }}>
              Verify document
            </button>
          </Link>
          <Link to="/login">
            <button style={{ padding:"6px 12px", background:"transparent", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:600, color:"var(--text-2)", cursor:"pointer", transition:".12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-alt)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              Sign in
            </button>
          </Link>
          <Link to="/register">
            <button style={{ padding:"6px 13px", background:"var(--text-1)", border:"1px solid var(--text-1)", borderRadius:"var(--radius-sm)", fontSize:12.5, fontWeight:700, color:"var(--surface)", cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:".12s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Get started <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ padding:"80px 6% 72px", textAlign:"center", maxWidth:720, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:99, fontSize:11.5, fontWeight:700, color:"var(--accent)", marginBottom:24, animation:"fadeUp .4s ease" }}>
          <Zap size={11} />  Blockchain-secured document integrity
        </div>
        <h1 style={{ fontSize:"clamp(30px,5vw,52px)", fontWeight:900, color:"var(--text-1)", lineHeight:1.12, letterSpacing:"-1.5px", marginBottom:20, animation:"fadeUp .4s .08s ease both" }}>
          Prove your documents<br />are authentic — forever
        </h1>
        <p style={{ fontSize:16, color:"var(--text-3)", lineHeight:1.72, maxWidth:500, margin:"0 auto 32px", animation:"fadeUp .4s .14s ease both" }}>
          KMS Chain creates a permanent, tamper-proof blockchain record of your documents using SHA-256 cryptography. Upload once, verify anytime, anywhere.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", animation:"fadeUp .4s .18s ease both" }}>
          <Link to="/register">
            <button style={{ padding:"12px 26px", background:"var(--text-1)", color:"var(--surface)", border:"1px solid var(--text-1)", borderRadius:"var(--radius)", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
              Start for free <ArrowRight size={15} />
            </button>
          </Link>
          <Link to="/verify">
            <button style={{ padding:"12px 20px", background:"var(--surface)", color:"var(--text-1)", border:"1px solid var(--border)", borderRadius:"var(--radius)", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:7, boxShadow:"var(--shadow-xs)" }}>
              <ShieldCheck size={15} /> Verify a document
            </button>
          </Link>
        </div>
        <div style={{ marginTop:28, display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap", animation:"fadeUp .4s .22s ease both" }}>
          {["No account needed to verify","Free to start","SHA-256 cryptography"].map(t => (
            <div key={t} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-4)", fontWeight:500 }}>
              <CheckCircle2 size={12} color="var(--ok)" />{t}
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{ background:"var(--text-1)", padding:"44px 6%", transition:"background .2s" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:32, textAlign:"center" }}>
          {stats.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:900, color:"var(--surface)", letterSpacing:"-1px", marginBottom:6 }}>{value}</div>
              <div style={{ fontSize:12.5, color:"rgba(255,255,255,.4)", fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding:"76px 6%" }}>
        <div style={{ maxWidth:940, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", letterSpacing:".09em", textTransform:"uppercase", marginBottom:10 }}>Features</div>
            <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:"var(--text-1)", letterSpacing:"-.5px", marginBottom:12 }}>Built for document trust</h2>
            <p style={{ fontSize:14.5, color:"var(--text-3)", maxWidth:420, margin:"0 auto" }}>Enterprise-grade cryptography and transparent blockchain — simplified for everyone.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
            {features.map(({ icon:Icon, title, desc }) => (
              <div key={title} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"20px 22px", transition:"all .15s", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ width:34, height:34, background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-2)", marginBottom:14 }}>
                  <Icon size={16} />
                </div>
                <div style={{ fontSize:13.5, fontWeight:800, color:"var(--text-1)", marginBottom:8, letterSpacing:"-.2px" }}>{title}</div>
                <div style={{ fontSize:12.5, color:"var(--text-3)", lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ background:"var(--bg-alt)", padding:"76px 6%", transition:"background .2s" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", letterSpacing:".09em", textTransform:"uppercase", marginBottom:10 }}>Process</div>
            <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:"var(--text-1)", letterSpacing:"-.5px" }}>How KMS Chain works</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:20 }}>
            {[
              { n:"01", emoji:"📄", title:"Upload file",         desc:"Select any PDF, image, or document up to 10 MB." },
              { n:"02", emoji:"🔐", title:"Generate SHA-256",    desc:"A unique 64-character hash is computed from your file." },
              { n:"03", emoji:"⛓",  title:"Anchor to blockchain",desc:"The hash is mined into a new block — permanently." },
              { n:"04", emoji:"✅", title:"Verify anytime",       desc:"Upload the file again or share the hash for verification." },
            ].map(({ n, emoji, title, desc }, i) => (
              <div key={n} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"20px", textAlign:"center", position:"relative" }}>
                <div style={{ fontSize:11, fontWeight:800, color:"var(--text-4)", letterSpacing:".07em", marginBottom:10 }}>STEP {n}</div>
                <div style={{ fontSize:30, marginBottom:12 }}>{emoji}</div>
                <div style={{ fontSize:13, fontWeight:800, color:"var(--text-1)", marginBottom:7 }}>{title}</div>
                <div style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMIN ENTRY ── */}
      <section style={{ padding:"60px 6%" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* User signup */}
            <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"28px 26px" }}>
              <div style={{ width:40, height:40, background:"var(--accent-bg)", border:"1px solid var(--accent-border)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, color:"var(--accent)" }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize:17, fontWeight:900, color:"var(--text-1)", letterSpacing:"-.3px", marginBottom:8 }}>User & Verifier Access</h3>
              <p style={{ fontSize:13, color:"var(--text-3)", lineHeight:1.65, marginBottom:20 }}>
                Create your account as a User to upload documents, or as a Verifier to authenticate them.
              </p>
              <div style={{ display:"flex", gap:8 }}>
                <Link to="/register"><button style={{ padding:"9px 16px", background:"var(--text-1)", color:"var(--surface)", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer" }}>Create account</button></Link>
                <Link to="/login"><button style={{ padding:"9px 14px", background:"transparent", color:"var(--text-2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:600, cursor:"pointer" }}>Sign in</button></Link>
              </div>
            </div>
            {/* Admin login */}
            <div style={{ background:"var(--text-1)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", padding:"28px 26px", transition:"background .2s" }}>
              <div style={{ width:40, height:40, background:"rgba(255,255,255,.1)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16, color:"rgba(255,255,255,.8)" }}>
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize:17, fontWeight:900, color:"var(--surface)", letterSpacing:"-.3px", marginBottom:8 }}>Administrator Portal</h3>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.5)", lineHeight:1.65, marginBottom:20 }}>
                System administrators can manage users, monitor audit trails, and explore the full blockchain.
              </p>
              <Link to="/admin-login">
                <button style={{ padding:"9px 16px", background:"rgba(255,255,255,.12)", color:"var(--surface)", border:"1px solid rgba(255,255,255,.2)", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:".12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.18)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.12)"}>
                  <Lock size={13} /> Admin login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" style={{ background:"var(--bg-alt)", padding:"76px 6%", transition:"background .2s" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", letterSpacing:".09em", textTransform:"uppercase", marginBottom:10 }}>Team</div>
            <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:"var(--text-1)", letterSpacing:"-.5px", marginBottom:12 }}>Built by our team</h2>
            <p style={{ fontSize:14, color:"var(--text-3)" }}>The minds behind KMS Chain</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
            {team.map(({ name, role, emoji, color, bg, border, desc }) => (
              <div key={name} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius-lg)", overflow:"hidden", transition:"all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "var(--shadow)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                {/* Color band */}
                <div style={{ height:4, background:color }} />
                <div style={{ padding:"20px 22px" }}>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"5px 12px", background:bg, border:`1px solid ${border}`, borderRadius:99, fontSize:12, fontWeight:800, color, marginBottom:14 }}>
                    {emoji} {role}
                  </div>
                  <div style={{ fontSize:15, fontWeight:900, color:"var(--text-1)", letterSpacing:"-.2px", marginBottom:6 }}>{name}</div>
                  <div style={{ fontSize:12, color:"var(--text-3)", lineHeight:1.6 }}>{desc}</div>
                  <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:5 }}>
                    <Award size={12} color="var(--text-4)" />
                    <span style={{ fontSize:11, color:"var(--text-4)", fontWeight:500 }}>KMS Chain Project 2025</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding:"76px 6%" }}>
        <div style={{ maxWidth:560, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text-4)", letterSpacing:".09em", textTransform:"uppercase", marginBottom:10 }}>Contact</div>
          <h2 style={{ fontSize:"clamp(22px,3vw,34px)", fontWeight:900, color:"var(--text-1)", letterSpacing:"-.5px", marginBottom:12 }}>Get in touch</h2>
          <p style={{ fontSize:14, color:"var(--text-3)", lineHeight:1.7, marginBottom:28 }}>
            Have a question about KMS Chain? Reach out to the team.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {team.map(({ name, emoji, color, bg, border }) => (
              <div key={name} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"14px 12px", textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{emoji}</div>
                <div style={{ fontSize:11.5, fontWeight:700, color:"var(--text-1)", marginBottom:3 }}>{name.split(" ")[0]}</div>
                <div style={{ fontSize:10, color:"var(--text-4)" }}>{name.split(" ").slice(1).join(" ")}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:24, padding:"14px 18px", background:"var(--bg-alt)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", fontSize:12.5, color:"var(--text-3)" }}>
            📧 Contact us via the department portal or your institution's communication channel.
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:"var(--text-1)", padding:"72px 6%", textAlign:"center", transition:"background .2s" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{ fontSize:30, marginBottom:18 }}>⛓</div>
          <h2 style={{ fontSize:"clamp(22px,3.5vw,36px)", fontWeight:900, color:"var(--surface)", letterSpacing:"-.6px", lineHeight:1.2, marginBottom:14 }}>
            Start protecting your documents today
          </h2>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.45)", lineHeight:1.65, marginBottom:28 }}>
            Free account. Instant blockchain registration. No credit card.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/register">
              <button style={{ padding:"12px 26px", background:"var(--surface)", color:"var(--text-1)", border:"none", borderRadius:"var(--radius)", fontSize:14, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}>
                Create free account <ArrowRight size={15} />
              </button>
            </Link>
            <Link to="/verify">
              <button style={{ padding:"12px 20px", background:"transparent", color:"rgba(255,255,255,.65)", border:"1px solid rgba(255,255,255,.15)", borderRadius:"var(--radius)", fontSize:14, fontWeight:600, cursor:"pointer" }}>
                Verify a document
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:"var(--text-1)", borderTop:"1px solid rgba(255,255,255,.07)", padding:"22px 6%" }}>
        <div style={{ maxWidth:940, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:22, height:22, background:"var(--accent)", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
              <Link2 size={12} />
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,.6)" }}>KMS Chain</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.2)" }}>·</span>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.2)" }}>Built by Azhar · Arpan · Aviraj</span>
          </div>
          <div style={{ display:"flex", gap:20 }}>
            {[["Home","#hero"],["Features","#features"],["Team","#team"],["Verify","/verify"],["Sign in","/login"]].map(([l,h]) =>
              h.startsWith("#") ? (
                <a key={l} href={h} style={{ fontSize:12, color:"rgba(255,255,255,.3)", fontWeight:500 }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.65)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>{l}</a>
              ) : (
                <Link key={l} to={h} style={{ fontSize:12, color:"rgba(255,255,255,.3)", fontWeight:500 }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.65)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}>{l}</Link>
              )
            )}
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.18)" }}>© 2025 KMS Chain. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
