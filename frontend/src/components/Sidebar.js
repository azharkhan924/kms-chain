import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut, Lock,
  LayoutDashboard, Upload, FileText, ShieldCheck,
  Users, ListChecks, Link2, ScrollText, Settings, Star } from "lucide-react";

const nav = {
  USER:     [
    { key:"dashboard", Icon:LayoutDashboard, label:"Dashboard"       },
    { key:"upload",    Icon:Upload,          label:"Upload Document"  },
    { key:"history",   Icon:FileText,        label:"My Documents"     },
  ],
  VERIFIER: [
    { key:"dashboard", Icon:LayoutDashboard, label:"Dashboard"           },
    { key:"verify",    Icon:ShieldCheck,     label:"Verify Documents"    },
    { key:"logs",      Icon:ListChecks,      label:"Verification History"},
  ],
  ADMIN: [
    { key:"dashboard",  Icon:LayoutDashboard, label:"Dashboard"           },
    { key:"users",      Icon:Users,           label:"Users"               },
    { key:"documents",  Icon:FileText,        label:"All Documents"       },
    { key:"verif-logs", Icon:ShieldCheck,     label:"Verification Logs"   },
    { key:"audit",      Icon:ScrollText,      label:"Audit Trail"         },
    { key:"trust",      Icon:Star,            label:"Trust Scores"        },
    { key:"blockchain", Icon:Link2,           label:"Blockchain Explorer" },
  ],
};

export default function Sidebar({ active, onNav }) {
  const { user, logoutUser } = useAuth();
  const { isDark, toggle }   = useTheme();
  const navigate = useNavigate();
  const items    = nav[user?.role] || [];
  const initials = user?.fullName?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2) || "?";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark"><Link2 size={14} /></div>
        <div>
          <div className="logo-title">KMS Chain</div>
          <div className="logo-sub">Blockchain Verification</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {items.map(({ key, Icon, label }) => (
          <button key={key}
            className={`nav-item${active === key ? " active" : ""}`}
            onClick={() => onNav(key)}>
            <Icon size={14} className="nav-icon" />{label}
          </button>
        ))}

        <div className="nav-section" style={{ marginTop:12 }}>Account</div>
        <button className={`nav-item${active === "profile" ? " active" : ""}`} onClick={() => onNav("profile")}>
          <Settings size={14} className="nav-icon" />Settings
        </button>
        <div className="nav-item" style={{ cursor:"default", opacity:.4 }}>
          <Lock size={14} className="nav-icon" />Secure Session
          <span className="nav-count">ON</span>
        </div>
      </nav>

      {/* Theme toggle in sidebar */}
      <div style={{ padding:"0 8px 10px" }}>
        <button onClick={toggle} style={{
          width:"100%", display:"flex", alignItems:"center", gap:8,
          padding:"8px 10px", borderRadius:"var(--radius-sm)",
          background:"transparent", border:"none", cursor:"pointer",
          color:"var(--sidebar-text)", fontSize:12.5, fontWeight:500,
          transition:".12s", fontFamily:"inherit"
        }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--sidebar-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-av">{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="user-name-s" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.fullName}</div>
            <div className="user-role-s">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={() => { logoutUser(); navigate("/login"); }} title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
