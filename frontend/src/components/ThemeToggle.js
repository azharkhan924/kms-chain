import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ size = "md" }) {
  const { isDark, toggle } = useTheme();
  const s = size === "sm" ? 14 : 16;

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: size === "sm" ? "5px 9px" : "6px 11px",
        background: "var(--bg-alt)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-2)",
        cursor: "pointer",
        fontSize: 12, fontWeight: 600,
        transition: "all .12s",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
    >
      {isDark ? <Sun size={s} /> : <Moon size={s} />}
      {size !== "sm" && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
