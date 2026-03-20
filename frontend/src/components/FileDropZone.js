import { useRef, useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";

const fmtSize = b => b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

export default function FileDropZone({ file, onFile, accept }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const onDrop = e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };

  return (
    <div
      className={`drop-zone${drag ? " active" : ""}${file ? " has-file" : ""}`}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
    >
      <input ref={ref} type="file" hidden
        accept={accept || ".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <>
          <div className="drop-icon-box" style={{ background:"var(--ok-bg)", borderColor:"var(--ok-border)", color:"var(--ok)" }}><CheckCircle2 size={18} /></div>
          <div className="drop-file-name">{file.name}</div>
          <div style={{ fontSize:11, color:"var(--text-4)", marginTop:4 }}>{fmtSize(file.size)} · click to change</div>
        </>
      ) : (
        <>
          <div className="drop-icon-box"><Upload size={18} /></div>
          <div className="drop-text">Drag & drop or <b>browse</b></div>
          <div className="drop-hint">PDF, JPG, PNG, DOC, TXT · max 10 MB</div>
        </>
      )}
    </div>
  );
}
