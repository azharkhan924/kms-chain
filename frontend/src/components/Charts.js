import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", fontSize:12, boxShadow:"var(--shadow)" }}>
      {label && <div style={{ fontWeight:700, color:"var(--text-1)", marginBottom:4 }}>{label}</div>}
      {payload.map(p => <div key={p.name} style={{ color:p.color||"var(--text-2)", fontWeight:600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export function DocumentStatusPie({ verified=0, tampered=0, pending=0, expired=0 }) {
  const data = [
    { name:"Verified", value:verified, color:"var(--ok)"     },
    { name:"Tampered", value:tampered, color:"var(--danger)" },
    { name:"Pending",  value:pending,  color:"var(--warn)"   },
    { name:"Expired",  value:expired,  color:"var(--text-4)" },
  ].filter(d => d.value > 0);
  if (!data.length) return (
    <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-4)", fontSize:13 }}>No data yet</div>
  );
  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip content={<Tip />} />
        <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:11, color:"var(--text-2)", fontWeight:600 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function VerificationTrend({ logs = [] }) {
  const today = new Date();
  const data  = Array.from({ length:7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6-i));
    const label = d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
    const day   = logs.filter(l => l.verifiedAt && new Date(l.verifiedAt).toDateString() === d.toDateString());
    return { day: label, verified: day.filter(l => l.verified).length, tampered: day.filter(l => !l.verified).length };
  });
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} barCategoryGap="35%">
        <XAxis dataKey="day" tick={{ fontSize:10, fill:"var(--text-4)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"var(--text-4)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<Tip />} cursor={{ fill:"var(--bg-alt)" }} />
        <Bar dataKey="verified" name="Verified" stackId="a" fill="var(--ok)"     radius={[0,0,0,0]} maxBarSize={30} />
        <Bar dataKey="tampered" name="Tampered" stackId="a" fill="var(--danger)" radius={[4,4,0,0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function UserRoleBar({ admin=0, verifier=0, user=0 }) {
  const data = [{ role:"User", count:user }, { role:"Verifier", count:verifier }, { role:"Admin", count:admin }];
  return (
    <ResponsiveContainer width="100%" height={170}>
      <BarChart data={data} barCategoryGap="40%">
        <XAxis dataKey="role" tick={{ fontSize:11, fill:"var(--text-3)", fontWeight:600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize:10, fill:"var(--text-4)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<Tip />} cursor={{ fill:"var(--bg-alt)" }} />
        <Bar dataKey="count" name="Users" radius={[5,5,0,0]} fill="var(--text-1)" maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CategoryBar({ stats = [] }) {
  const CAT_COLORS = {
    LEGAL:"#2563eb", ACADEMIC:"#7c3aed", FINANCIAL:"#16a34a",
    MEDICAL:"#dc2626", CONTRACT:"#ca8a04", CERTIFICATE:"#ea580c",
    IDENTITY:"#0891b2", OTHER:"#71717a"
  };
  const data = [...stats]
    .map(s => ({
      name: s.category ? (s.category.charAt(0) + s.category.slice(1).toLowerCase()) : "Other",
      count: s.count,
      fill: CAT_COLORS[s.category] || "#71717a"
    }))
    .sort((a,b) => b.count - a.count);

  if (!data.length) return (
    <div style={{ height:160, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-4)", fontSize:13 }}>No documents</div>
  );
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 26)}>
      <BarChart data={data} barCategoryGap="30%" layout="vertical">
        <XAxis type="number" tick={{ fontSize:10, fill:"var(--text-4)" }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:"var(--text-3)", fontWeight:600 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip content={<Tip />} cursor={{ fill:"var(--bg-alt)" }} />
        <Bar dataKey="count" name="Docs" radius={[0,4,4,0]} maxBarSize={14}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrustScoreGauge({ score = 50 }) {
  const color = score >= 85 ? "#16a34a" : score >= 70 ? "#2563eb" : score >= 50 ? "#ca8a04" : score >= 30 ? "#ea580c" : "#dc2626";
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : score >= 30 ? "Low" : "Critical";
  const data  = [
    { name:"Score", value: score,     fill: color           },
    { name:"Rem",   value: 100-score, fill: "transparent"   },
  ];
  return (
    <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", width:120, height:120 }}>
      <ResponsiveContainer width={120} height={120}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="58%" outerRadius="85%"
          data={data} startAngle={200} endAngle={-20} barSize={10}>
          <RadialBar dataKey="value" cornerRadius={5} background={{ fill:"var(--bg-alt)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ position:"absolute", textAlign:"center" }}>
        <div style={{ fontSize:24, fontWeight:900, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:9, fontWeight:800, color:"var(--text-4)", letterSpacing:".06em", textTransform:"uppercase", marginTop:2 }}>{grade}</div>
      </div>
    </div>
  );
}
