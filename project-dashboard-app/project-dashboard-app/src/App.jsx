import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, Search, LayoutGrid, Rows3,
  MapPin, Building2, ChevronRight, Check, AlertTriangle
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants & config                                                 */
/* ------------------------------------------------------------------ */

const STATUSES = ["On Track", "At Risk", "Delayed", "Not Started", "Completed"];

const STATUS_CONFIG = {
  "On Track":    { emoji: "🟢", color: "#2E8B57", bg: "#E7F5EC", border: "#BEE3CC" },
  "At Risk":     { emoji: "🟠", color: "#C77817", bg: "#FBF0DE", border: "#F0D8A8" },
  "Delayed":     { emoji: "🔴", color: "#C1443A", bg: "#FBEAE8", border: "#F0C4BF" },
  "Not Started": { emoji: "🔵", color: "#4A5FC1", bg: "#ECEEFA", border: "#C9CFF0" },
  "Completed":   { emoji: "✅", color: "#1C8C74", bg: "#E5F5F1", border: "#B9E3D6" },
};

const STORAGE_KEY = "projects";

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const SAMPLE_PROJECTS = [
  {
    id: "p1",
    code: "CE-014",
    name: "Trans-Pennine Gas Main Renewal",
    client: "Cadent Gas",
    location: "Stockport, Greater Manchester",
    status: "On Track",
    progress: 62,
    startDate: "2026-02-10",
    endDate: "2026-09-30",
    description: "Replacement of 4.2km of ageing medium-pressure gas main beneath residential streets, phased to minimise disruption to residents.",
    notes: "Phase 2 (Bramhall Lane section) traffic management approved by the council. Awaiting delivery of PE pipe for phase 3.",
  },
  {
    id: "p2",
    code: "CE-021",
    name: "Ladybrook Wastewater Upgrade",
    client: "United Utilities",
    location: "Bramhall, Cheshire",
    status: "At Risk",
    progress: 38,
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    description: "Capacity upgrade of the wastewater treatment works ahead of an adjacent housing development, including new inlet works and clarifier.",
    notes: "Long-lead electrical switchgear delayed by supplier — currently tracking 3 weeks behind programme. Mitigation options being reviewed with the client.",
  },
  {
    id: "p3",
    code: "CE-009",
    name: "A6 Bridge Deck Refurbishment",
    client: "National Highways",
    location: "Hazel Grove, Stockport",
    status: "Delayed",
    progress: 21,
    startDate: "2025-11-01",
    endDate: "2026-06-01",
    description: "Structural refurbishment of the bridge deck, joint replacement and waterproofing renewal over the A6 trunk road.",
    notes: "Night-time possessions cancelled twice due to weather. Revised sequencing being discussed with the principal contractor.",
  },
  {
    id: "p4",
    code: "CE-027",
    name: "Woodford Reservoir Embankment Survey",
    client: "Severn Trent",
    location: "Woodford, Cheshire",
    status: "Not Started",
    progress: 0,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    description: "Topographic and geotechnical survey ahead of embankment strengthening works, including borehole investigation and stability assessment.",
    notes: "Scope and fee agreed. Waiting on site access agreement before mobilisation.",
  },
  {
    id: "p5",
    code: "CE-011",
    name: "Portwood Flood Defence Scheme",
    client: "Environment Agency",
    location: "Portwood, Stockport",
    status: "On Track",
    progress: 74,
    startDate: "2025-10-01",
    endDate: "2026-08-01",
    description: "New flood wall and pumping station along the River Tame to protect the Portwood industrial estate from a 1-in-100-year event.",
    notes: "Concrete wall sections complete. Pumping station M&E fit-out underway.",
  },
  {
    id: "p6",
    code: "CE-002",
    name: "Heaton Chapel Water Main Replacement",
    client: "United Utilities",
    location: "Heaton Chapel, Stockport",
    status: "Completed",
    progress: 100,
    startDate: "2025-06-01",
    endDate: "2025-12-15",
    description: "Replacement of 1.8km of Victorian-era cast iron water main with MDPE, including reinstatement of carriageway and footway.",
    notes: "Practical completion certified. Defects period runs to June 2026.",
  },
  {
    id: "p7",
    code: "CE-018",
    name: "Cheadle Interchange Drainage Improvement",
    client: "Stockport Council",
    location: "Cheadle, Greater Manchester",
    status: "On Track",
    progress: 55,
    startDate: "2026-03-01",
    endDate: "2026-10-15",
    description: "New SuDS drainage system for the Cheadle Interchange junction to address recurring surface water flooding.",
    notes: "Attenuation tank installed. Landscaping and signage package out to tender.",
  },
  {
    id: "p8",
    code: "CE-023",
    name: "Marple Aqueduct Pipeline Crossing",
    client: "Cadent Gas",
    location: "Marple, Stockport",
    status: "At Risk",
    progress: 45,
    startDate: "2026-01-20",
    endDate: "2026-08-20",
    description: "Trenchless directional drilling of a new gas pipeline crossing beneath the Peak Forest Canal aqueduct.",
    notes: "Ground conditions harder than anticipated in trial pit — reviewing drill head selection with the specialist subcontractor.",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function makeId() {
  return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function nextCode(projects) {
  const nums = projects
    .map((p) => (p.code && /^CE-(\d+)$/.test(p.code) ? parseInt(p.code.split("-")[1], 10) : 0))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return "CE-" + String(max + 1).padStart(3, "0");
}

const emptyDraft = () => ({
  id: null,
  code: "",
  name: "",
  client: "",
  location: "",
  status: "Not Started",
  progress: 0,
  startDate: "",
  endDate: "",
  description: "",
  notes: "",
});

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status, size = "md" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Not Started"];
  const pad = size === "sm" ? "3px 8px" : "4px 10px";
  const font = size === "sm" ? "12px" : "13px";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: pad,
        borderRadius: 999,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: font,
        fontWeight: 600,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true">{cfg.emoji}</span>
      {status}
    </span>
  );
}

function ProgressGauge({ value, color, height = 8, showLabel = true }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  return (
    <div>
      <div
        style={{
          position: "relative",
          height,
          borderRadius: height,
          background: "#EDEFEE",
          overflow: "hidden",
          border: "1px solid #E1E4E1",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: v + "%",
            background: color,
            borderRadius: height,
            transition: "width 0.25s ease",
          }}
        />
        {ticks.map((t) => (
          <div
            key={t}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: t + "%",
              width: 1,
              background: "rgba(27,34,38,0.12)",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <div
          style={{
            marginTop: 4,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: "#5D6A6F",
          }}
        >
          {v}% complete
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        background: "#FFFFFF",
        border: `1px solid ${active ? accent : "#E1E4E1"}`,
        boxShadow: active ? `0 0 0 2px ${accent}22` : "none",
        borderRadius: 10,
        padding: "14px 16px",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 12, color: "#5D6A6F", fontWeight: 600, letterSpacing: 0.2, textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 26,
          fontWeight: 600,
          color: accent || "#1B2226",
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Project card (grid view)                                           */
/* ------------------------------------------------------------------ */

function ProjectCard({ project, onOpen }) {
  const cfg = STATUS_CONFIG[project.status];
  return (
    <div
      onClick={() => onOpen(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(project)}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E1E4E1",
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.15s ease, transform 0.1s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#B9C4CC")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E1E4E1")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#8A9298",
              letterSpacing: 0.5,
              marginBottom: 3,
            }}
          >
            {project.code}
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 16,
              color: "#1B2226",
              lineHeight: 1.3,
            }}
          >
            {project.name}
          </div>
        </div>
        <StatusBadge status={project.status} size="sm" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#5D6A6F" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Building2 size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.client}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.location}</span>
        </div>
      </div>

      <p
        style={{
          fontSize: 13,
          color: "#43494C",
          lineHeight: 1.5,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {project.description}
      </p>

      <ProgressGauge value={project.progress} color={cfg.color} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          fontFamily: "'IBM Plex Mono', monospace",
          color: "#8A9298",
          borderTop: "1px solid #EEF0EF",
          paddingTop: 10,
          marginTop: 2,
        }}
      >
        <span>Start {formatDate(project.startDate)}</span>
        <span>Due {formatDate(project.endDate)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Table row (table view)                                             */
/* ------------------------------------------------------------------ */

function ProjectRow({ project, onOpen }) {
  const cfg = STATUS_CONFIG[project.status];
  return (
    <tr
      onClick={() => onOpen(project)}
      style={{ cursor: "pointer", borderBottom: "1px solid #EEF0EF" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFA")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "12px 14px" }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A9298" }}>{project.code}</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: "#1B2226" }}>
          {project.name}
        </div>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 13, color: "#43494C" }}>{project.client}</td>
      <td style={{ padding: "12px 14px", fontSize: 13, color: "#43494C" }}>{project.location}</td>
      <td style={{ padding: "12px 14px" }}>
        <StatusBadge status={project.status} size="sm" />
      </td>
      <td style={{ padding: "12px 14px", minWidth: 140 }}>
        <ProgressGauge value={project.progress} color={cfg.color} showLabel={false} />
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A9298", marginTop: 4 }}>
          {project.progress}%
        </div>
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#5D6A6F", whiteSpace: "nowrap" }}>
        {formatDate(project.startDate)}
      </td>
      <td style={{ padding: "12px 14px", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#5D6A6F", whiteSpace: "nowrap" }}>
        {formatDate(project.endDate)}
      </td>
      <td style={{ padding: "12px 14px", width: 28 }}>
        <ChevronRight size={16} color="#B9C4CC" />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Field helpers for the form                                         */
/* ------------------------------------------------------------------ */

const inputStyle = {
  width: "100%",
  padding: "9px 11px",
  fontSize: 14,
  fontFamily: "'Inter', sans-serif",
  color: "#1B2226",
  background: "#FFFFFF",
  border: "1px solid #D8DBD9",
  borderRadius: 7,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "#5D6A6F",
  marginBottom: 5,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Project modal — view / edit / create                               */
/* ------------------------------------------------------------------ */

function ProjectModal({ mode, project, onClose, onSave, onDelete }) {
  const isCreate = mode === "create";
  const [editing, setEditing] = useState(isCreate);
  const [draft, setDraft] = useState(project ? { ...project } : emptyDraft());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDraft(project ? { ...project } : emptyDraft());
    setEditing(isCreate);
    setConfirmDelete(false);
    setErrors({});
  }, [project, mode]);

  const update = (field) => (e) => {
    const value = field === "progress" ? Number(e.target.value) : e.target.value;
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!draft.name.trim()) errs.name = "Project name is required.";
    if (!draft.client.trim()) errs.client = "Client is required.";
    if (!draft.location.trim()) errs.location = "Location is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(draft);
  };

  const cfg = STATUS_CONFIG[draft.status] || STATUS_CONFIG["Not Started"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(27,34,38,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 14,
          width: "100%",
          maxWidth: 640,
          maxHeight: "90vh",
          overflowY: "auto",
          border: "1px solid #E1E4E1",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #EEF0EF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "sticky",
            top: 0,
            background: "#FFFFFF",
            borderRadius: "14px 14px 0 0",
          }}
        >
          <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8A9298", marginBottom: 4 }}>
              {isCreate ? "New project" : draft.code}
            </div>
            {editing ? (
              <input
                style={{ ...inputStyle, fontSize: 18, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", padding: "6px 9px" }}
                placeholder="Project name"
                value={draft.name}
                onChange={update("name")}
              />
            ) : (
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 19, color: "#1B2226" }}>
                {draft.name}
              </div>
            )}
            {errors.name && <div style={{ color: "#C1443A", fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, color: "#5D6A6F" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {!editing && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={draft.status} />
              <span style={{ fontSize: 13, color: "#8A9298" }}>·</span>
              <span style={{ fontSize: 13, color: "#5D6A6F" }}>
                {formatDate(draft.startDate)} — {formatDate(draft.endDate)}
              </span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Client">
              {editing ? (
                <input style={inputStyle} value={draft.client} onChange={update("client")} placeholder="Client name" />
              ) : (
                <div style={{ fontSize: 14, color: "#1B2226" }}>{draft.client}</div>
              )}
              {errors.client && <div style={{ color: "#C1443A", fontSize: 12, marginTop: 4 }}>{errors.client}</div>}
            </Field>
            <Field label="Location">
              {editing ? (
                <input style={inputStyle} value={draft.location} onChange={update("location")} placeholder="Site location" />
              ) : (
                <div style={{ fontSize: 14, color: "#1B2226" }}>{draft.location}</div>
              )}
              {errors.location && <div style={{ color: "#C1443A", fontSize: 12, marginTop: 4 }}>{errors.location}</div>}
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Status">
              {editing ? (
                <select style={inputStyle} value={draft.status} onChange={update("status")}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].emoji} {s}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={draft.status} size="sm" />
              )}
            </Field>
            <Field label={`Progress — ${draft.progress}%`}>
              {editing ? (
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={draft.progress}
                  onChange={update("progress")}
                  style={{ width: "100%" }}
                />
              ) : (
                <ProgressGauge value={draft.progress} color={cfg.color} showLabel={false} />
              )}
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Start date">
              {editing ? (
                <input type="date" style={inputStyle} value={draft.startDate} onChange={update("startDate")} />
              ) : (
                <div style={{ fontSize: 14, color: "#1B2226" }}>{formatDate(draft.startDate)}</div>
              )}
            </Field>
            <Field label="Expected completion">
              {editing ? (
                <input type="date" style={inputStyle} value={draft.endDate} onChange={update("endDate")} />
              ) : (
                <div style={{ fontSize: 14, color: "#1B2226" }}>{formatDate(draft.endDate)}</div>
              )}
            </Field>
          </div>

          <Field label="Description">
            {editing ? (
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
                value={draft.description}
                onChange={update("description")}
                placeholder="Short description of the project scope"
              />
            ) : (
              <p style={{ fontSize: 14, color: "#43494C", lineHeight: 1.6, margin: 0 }}>{draft.description || "—"}</p>
            )}
          </Field>

          <Field label="Notes">
            {editing ? (
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "'Inter', sans-serif" }}
                value={draft.notes}
                onChange={update("notes")}
                placeholder="Any additional notes"
              />
            ) : (
              <p style={{ fontSize: 14, color: "#43494C", lineHeight: 1.6, margin: 0 }}>{draft.notes || "—"}</p>
            )}
          </Field>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #EEF0EF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            bottom: 0,
            background: "#FFFFFF",
            borderRadius: "0 0 14px 14px",
          }}
        >
          <div>
            {!isCreate && !confirmDelete && (
              <button onClick={() => setConfirmDelete(true)} style={ghostBtn("#C1443A")}>
                <Trash2 size={15} /> Delete
              </button>
            )}
            {confirmDelete && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: "#5D6A6F" }}>Delete this project?</span>
                <button onClick={() => onDelete(draft.id)} style={solidBtn("#C1443A")}>
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)} style={ghostBtn("#5D6A6F")}>
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!confirmDelete && editing && (
              <button
                onClick={() => {
                  if (isCreate) {
                    onClose();
                  } else {
                    setDraft(project);
                    setEditing(false);
                    setErrors({});
                  }
                }}
                style={ghostBtn("#5D6A6F")}
              >
                Cancel
              </button>
            )}
            {!confirmDelete && editing && (
              <button onClick={handleSave} style={solidBtn("#2B5C8A")}>
                <Check size={15} /> {isCreate ? "Add project" : "Save changes"}
              </button>
            )}
            {!confirmDelete && !editing && (
              <button onClick={() => setEditing(true)} style={solidBtn("#2B5C8A")}>
                <Pencil size={15} /> Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ghostBtn(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    fontSize: 13,
    fontWeight: 600,
    color,
    background: "transparent",
    border: `1px solid ${color}33`,
    borderRadius: 8,
    cursor: "pointer",
  };
}

function solidBtn(color) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    color: "#FFFFFF",
    background: color,
    border: `1px solid ${color}`,
    borderRadius: 8,
    cursor: "pointer",
  };
}

/* ------------------------------------------------------------------ */
/*  Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const [view, setView] = useState("cards");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [modal, setModal] = useState(null); // { mode: 'view'|'edit'|'create', project }

  /* Load from the browser's local storage on mount */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setProjects(raw ? JSON.parse(raw) : SAMPLE_PROJECTS);
    } catch (err) {
      setProjects(SAMPLE_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  /* Persist whenever projects change (after initial load) */
  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaveError(false);
    } catch (err) {
      setSaveError(true);
    }
  }, []);

  useEffect(() => {
    if (!loading) persist(projects);
  }, [projects, loading, persist]);

  /* Derived data */
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.status === "Completed").length;
    const onTrack = projects.filter((p) => p.status === "On Track").length;
    const atRisk = projects.filter((p) => p.status === "At Risk").length;
    const active = projects.filter((p) => p.status !== "Completed" && p.status !== "Not Started").length;
    return { total, completed, onTrack, atRisk, active };
  }, [projects]);

  const filtered = useMemo(() => {
    let list = projects;
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.code || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, statusFilter, query]);

  /* Actions */
  const openView = (project) => setModal({ mode: "view", project });
  const openCreate = () => setModal({ mode: "create", project: { ...emptyDraft(), code: nextCode(projects) } });
  const closeModal = () => setModal(null);

  const handleSave = (draft) => {
    if (draft.id) {
      setProjects((prev) => prev.map((p) => (p.id === draft.id ? draft : p)));
    } else {
      setProjects((prev) => [...prev, { ...draft, id: makeId() }]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setModal(null);
  };

  const toggleStatusFilter = (status) => setStatusFilter((cur) => (cur === status ? null : status));

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#FAFAF9",
        minHeight: "100vh",
        color: "#1B2226",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 16,
            borderBottom: "2px solid #1B2226",
            paddingBottom: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8A9298", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Civil &amp; pipeline engineering
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, margin: 0, color: "#1B2226" }}>
              Project dashboard
            </h1>
          </div>
          <button onClick={openCreate} style={{ ...solidBtn("#2B5C8A"), padding: "10px 18px", fontSize: 14 }}>
            <Plus size={16} /> Add project
          </button>
        </div>

        {saveError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FBF0DE",
              border: "1px solid #F0D8A8",
              color: "#8A5A0E",
              fontSize: 13,
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <AlertTriangle size={15} />
            Changes couldn't be saved just now — keep this tab open, or try again in a moment.
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <StatCard label="Total projects" value={stats.total} active={!statusFilter} onClick={() => setStatusFilter(null)} />
          <StatCard label="Active" value={stats.active} accent="#2B5C8A" />
          <StatCard
            label="On track"
            value={stats.onTrack}
            accent={STATUS_CONFIG["On Track"].color}
            active={statusFilter === "On Track"}
            onClick={() => toggleStatusFilter("On Track")}
          />
          <StatCard
            label="At risk"
            value={stats.atRisk}
            accent={STATUS_CONFIG["At Risk"].color}
            active={statusFilter === "At Risk"}
            onClick={() => toggleStatusFilter("At Risk")}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            accent={STATUS_CONFIG["Completed"].color}
            active={statusFilter === "Completed"}
            onClick={() => toggleStatusFilter("Completed")}
          />
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#8A9298" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, clients, locations…"
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {statusFilter && (
              <button onClick={() => setStatusFilter(null)} style={ghostBtn("#5D6A6F")}>
                Clear filter <X size={13} />
              </button>
            )}
            <div style={{ display: "flex", border: "1px solid #D8DBD9", borderRadius: 8, overflow: "hidden" }}>
              <button
                onClick={() => setView("cards")}
                aria-label="Card view"
                style={{
                  padding: "8px 10px",
                  background: view === "cards" ? "#EAF2F8" : "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  color: view === "cards" ? "#2B5C8A" : "#5D6A6F",
                  display: "flex",
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("table")}
                aria-label="Table view"
                style={{
                  padding: "8px 10px",
                  background: view === "table" ? "#EAF2F8" : "#FFFFFF",
                  border: "none",
                  borderLeft: "1px solid #D8DBD9",
                  cursor: "pointer",
                  color: view === "table" ? "#2B5C8A" : "#5D6A6F",
                  display: "flex",
                }}
              >
                <Rows3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#8A9298", fontSize: 14 }}>Loading projects…</div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: "#8A9298",
              fontSize: 14,
              background: "#FFFFFF",
              border: "1px dashed #D8DBD9",
              borderRadius: 12,
            }}
          >
            No projects match your search.
          </div>
        ) : view === "cards" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} onOpen={openView} />
            ))}
          </div>
        ) : (
          <div style={{ background: "#FFFFFF", border: "1px solid #E1E4E1", borderRadius: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E1E4E1", textAlign: "left" }}>
                  {["Project", "Client", "Location", "Status", "Progress", "Start", "Due", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                        color: "#8A9298",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <ProjectRow key={p.id} project={p} onOpen={openView} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ProjectModal
          mode={modal.mode}
          project={modal.project}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
