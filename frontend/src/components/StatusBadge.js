export default function StatusBadge({ value }) {
  const cfg = {
    PENDING:  { cls:"badge-pending",  label:"Pending"  },
    VERIFIED: { cls:"badge-verified", label:"Verified" },
    TAMPERED: { cls:"badge-tampered", label:"Tampered" },
    REJECTED: { cls:"badge-rejected", label:"Rejected" },
    USER:     { cls:"badge-user",     label:"User"     },
    VERIFIER: { cls:"badge-verifier", label:"Verifier" },
    ADMIN:    { cls:"badge-admin",    label:"Admin"    },
    true:     { cls:"badge-active",   label:"Active"   },
    false:    { cls:"badge-inactive", label:"Inactive" },
  };
  const { cls, label } = cfg[String(value)] || { cls:"badge-rejected", label:String(value) };
  return <span className={`badge ${cls}`}><span className="badge-dot" />{label}</span>;
}
