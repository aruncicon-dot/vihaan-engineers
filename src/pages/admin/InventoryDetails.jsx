import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShoppingCart, ShieldCheck, History, MapPin,
  Calendar, FileText, Tag, Truck, Activity, Layers,
  ArrowUpRight, Warehouse, HardHat, Package, BadgeCheck,
  TrendingDown, Banknote, ReceiptText, ClipboardList,
  ChevronLeft, ChevronRight, Pencil, Zap, Download,
  Hash, Box, BarChart2, RefreshCw, Scale, Archive,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════════
   IMPORTANT: Set NAVBAR_HEIGHT_PX to the EXACT pixel height of your
   layout's top navbar. Looking at the screenshot, the Vihaan Engineers
   navbar appears to be ~80px. Adjust this one number if it's still off.
══════════════════════════════════════════════════════════════════════════ */
const NAVBAR_HEIGHT_PX = 80;

const LOGS_PER_PAGE = 5;
const BASE = "/admin/ve-supreme-sudo/inventory";

/* ── jsPDF loader ───────────────────────────────────────────────────────── */
function loadjsPDF() {
  return new Promise((resolve) => {
    if (window.jspdf) { resolve(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });
}

/* ── PDF generation ─────────────────────────────────────────────────────── */
async function generatePDF(data, history) {
  const jsPDF = await loadjsPDF();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const PW = 210;
  const M = 16;
  const CW = PW - M * 2;

  // Colour helpers
  const C = {
    blue:    [37,  99,  235],
    blueLt:  [147, 197, 253],
    dark:    [15,  23,  42],
    mid:     [71,  85,  105],
    light:   [148, 163, 184],
    xlight:  [203, 213, 225],
    bg:      [248, 250, 252],
    white:   [255, 255, 255],
    green:   [22,  163, 74],
    red:     [220, 38,  38],
  };

  let y = 0;

  /* ── page overflow guard ── */
  const need = (h) => {
    if (y + h > 272) { doc.addPage(); y = M; }
  };

  /* ── Header band ── */
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, PW, 36, "F");
  // blue accent top
  doc.setFillColor(...C.blue);
  doc.rect(0, 0, PW, 2.5, "F");

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("INVENTORY VOUCHER", M, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.blueLt);
  doc.text("Capital Spins — Asset Management System", M, 21);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, M, 27);

  // Barcode badge
  doc.setFillColor(...C.blue);
  doc.roundedRect(PW - M - 44, 8, 44, 14, 2, 2, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...C.white);
  doc.text(data.barcode || "—", PW - M - 22, 16.5, { align: "center" });

  y = 42;

  /* ── Material name block ── */
  doc.setFillColor(...C.bg);
  doc.rect(0, y - 2, PW, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...C.dark);
  doc.text(data.material_name || "—", M, y + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.light);
  doc.text(
    `Category: ${data.category || "—"}   |   Material ID: ${data.material_id || "—"}   |   Barcode: ${data.barcode || "—"}`,
    M, y + 17
  );
  y += 28;

  // divider
  doc.setDrawColor(...C.blue);
  doc.setLineWidth(0.4);
  doc.line(M, y, PW - M, y);
  y += 7;

  /* ── Section title helper ── */
  const secTitle = (t) => {
    need(14);
    doc.setFillColor(...C.blue);
    doc.rect(M, y, 3, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.blue);
    doc.text(t.toUpperCase(), M + 6, y + 4.5);
    y += 11;
  };

  /* ── 4-col KPI row ── */
  const kpiRow = (items) => {
    need(22);
    const cellW = CW / items.length;
    items.forEach((item, i) => {
      const bx = M + i * cellW;
      doc.setFillColor(...C.bg);
      doc.roundedRect(bx, y, cellW - 2, 18, 2, 2, "F");
      doc.setDrawColor(...C.xlight);
      doc.setLineWidth(0.25);
      doc.roundedRect(bx, y, cellW - 2, 18, 2, 2, "S");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.light);
      doc.text(item.label, bx + 3, y + 6);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...C.dark);
      doc.text(String(item.value ?? "—"), bx + 3, y + 13.5);
    });
    y += 22;
  };

  /* ── Label / value row ── */
  const lv = (label, value, alt) => {
    need(9);
    if (alt) { doc.setFillColor(...C.bg); doc.rect(M, y, CW, 8.5, "F"); }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.light);
    doc.text(label, M + 3, y + 5.8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.dark);
    const val = String(value ?? "—");
    doc.text(val, M + 58, y + 5.8);
    doc.setDrawColor(...C.bg);
    doc.setLineWidth(0.2);
    doc.line(M, y + 8.5, PW - M, y + 8.5);
    y += 9;
  };

  /* ── Highlight value box ── */
  const highlightBox = (label, value) => {
    need(24);
    doc.setFillColor(...C.blue);
    doc.roundedRect(M, y, CW, 22, 3, 3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.blueLt);
    doc.text(label.toUpperCase(), M + 5, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...C.white);
    doc.text(String(value ?? "—"), M + 5, y + 17);
    y += 26;
  };

  /* ═══ SECTION 1: Key Metrics ═══ */
  secTitle("Key Metrics");
  kpiRow([
    { label: "Available Stock",   value: `${data.current_quantity} ${data.unit_of_measurement}` },
    { label: "Initial Quantity",  value: `${data.initial_quantity} ${data.unit_of_measurement}` },
    { label: "Material Grade",    value: data.model_grade },
    { label: "BIS Standard",      value: data.is_bis_standard },
  ]);
  kpiRow([
    { label: "Depreciation Rate", value: `${data.depreciation_rate}% p.a.` },
    { label: "Condition",         value: data.condition_state },
    { label: "Purchase Type",     value: data.purchase_type },
    { label: "Returnable",        value: data.is_returnable ? "Yes" : "No" },
  ]);

  /* ═══ SECTION 2: Identification ═══ */
  secTitle("Identification & Classification");
  lv("Material ID",       data.material_id,       false);
  lv("Barcode",           data.barcode,            true);
  lv("Material Name",     data.material_name,      false);
  lv("Category",          data.category,           true);
  lv("Brand / Make",      data.brand,              false);
  lv("Model / Grade",     data.model_grade,        true);
  lv("Unit of Measure",   data.unit_of_measurement,false);
  y += 2;

  /* ═══ SECTION 3: Financial ═══ */
  secTitle("Financial Details");
  highlightBox(
    "Total Acquisition Value",
    `Rs. ${Number(data.purchase_price || 0).toLocaleString("en-IN")}`
  );
  lv("Supplier / Vendor",  data.supplier,    false);
  lv("Invoice / Bill No.", data.invoice_no,  true);
  lv("Purchase Date",      data.purchase_date, false);
  lv("Purchase Type",      data.purchase_type, true);
  lv("Entry Date",        (data.created_at || "").split(" ")[0], false);
  y += 2;

  /* ═══ SECTION 4: Stock ═══ */
  secTitle("Stock Information");
  lv("Initial Quantity",   `${data.initial_quantity} ${data.unit_of_measurement}`, false);
  lv("Current Quantity",   `${data.current_quantity} ${data.unit_of_measurement}`, true);
  lv("Depreciation Rate",  `${data.depreciation_rate}%`, false);
  y += 2;

  /* ═══ SECTION 5: Quality & Compliance ═══ */
  secTitle("Quality & Compliance");
  lv("Condition State",    data.condition_state,   false);
  lv("BIS Standard",       data.is_bis_standard,   true);
  lv("Warranty Period",    data.warranty_period,   false);
  lv("Returnable Policy",  data.is_returnable ? "Active — Returnable" : "Locked — Non-Returnable", true);
  y += 2;

  if (data.description) {
    need(22);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(M, y, CW, 20, 2, 2, "F");
    doc.setDrawColor(219, 234, 254);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, 20, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.blue);
    doc.text("DESCRIPTION", M + 4, y + 6);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.mid);
    const lines = doc.splitTextToSize(`"${data.description}"`, CW - 8);
    doc.text(lines.slice(0, 2), M + 4, y + 13);
    y += 24;
  }

  /* ═══ SECTION 6: Activity Ledger ═══ */
  if (history && history.length > 0) {
    secTitle("Activity Ledger");

    // Table header
    doc.setFillColor(...C.dark);
    doc.rect(M, y, CW, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.white);
    const th = (t, x) => doc.text(t, x, y + 5.5);
    th("#",          M + 2);
    th("Action",     M + 10);
    th("Qty",        M + 40);
    th("Date",       M + 56);
    th("Site / Zone",M + 80);
    th("Storage",    M + 122);
    th("Handled By", M + 152);
    y += 9;

    history.forEach((log, i) => {
      need(12);
      const alt = i % 2 === 1;
      if (alt) { doc.setFillColor(...C.bg); doc.rect(M, y, CW, 10, "F"); }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.mid);
      doc.text(String(i + 1).padStart(2, "0"), M + 2, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...C.dark);
      doc.text(String(log.action_type || "").slice(0, 14), M + 10, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...C.green);
      doc.text(`+${log.quantity_affected}`, M + 40, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...C.mid);
      doc.text(String(log.action_date || "").replace(" ", "\n"), M + 56, y + 5);

      const site = `${log.project_site || ""} / ${log.location_zone || ""}`;
      doc.text(site.slice(0, 22), M + 80, y + 7);
      doc.text(String(log.storage_location || "").slice(0, 16), M + 122, y + 7);
      doc.text(String(log.handled_by || "").slice(0, 14), M + 152, y + 7);

      doc.setDrawColor(...C.xlight);
      doc.setLineWidth(0.15);
      doc.line(M, y + 10, PW - M, y + 10);
      y += 11;

      if (log.notes) {
        need(9);
        doc.setFillColor(239, 246, 255);
        doc.rect(M, y, CW, 7.5, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(6.5);
        doc.setTextColor(...C.mid);
        doc.text(`Note: ${String(log.notes).slice(0, 100)}`, M + 4, y + 5);
        y += 8.5;
      }
    });
  }

  /* ── Footer on every page ── */
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFillColor(...C.dark);
    doc.rect(0, 287, PW, 10, "F");
    doc.setFillColor(...C.blue);
    doc.rect(0, 287, PW, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...C.light);
    doc.text("Capital Spins — Confidential Asset Record. Do not distribute.", M, 293.5);
    doc.text(`Page ${p} of ${total}`, PW - M, 293.5, { align: "right" });
  }

  doc.save(`voucher-${data.barcode || data.material_id || "inv"}.pdf`);
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ total, page, perPage, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
      <span className="text-xs font-semibold text-slate-400">
        Showing {start}–{end} of {total} logs
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={13} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{ fontWeight: 600 }}
            className={`h-8 min-w-[32px] px-2.5 rounded-lg border text-xs transition-all ${
              page === p
                ? "bg-blue-600 text-white border-blue-600"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}

/* ── Reusable field row (label + value) ────────────────────────────────── */
function FieldRow({ Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
          <Icon size={12} className="text-slate-400" />
        </div>
        <span className="text-[11.5px] font-semibold text-slate-500">{label}</span>
      </div>
      <span className={`text-[12px] font-bold text-slate-800 text-right ${mono ? "font-mono" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────────────── */
function SectionHeading({ Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={11} className="text-slate-400 flex-shrink-0" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function InventoryDetails() {
  const [item, setItem]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [logPage, setLogPage]   = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const { id }   = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`https://capitalspins.com/api/get_inventory.php?id=${id}`)
      .then((r) => r.json())
      .then((json) => { if (json.status === "success") setItem(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePDF = useCallback(async () => {
    if (!item) return;
    setPdfLoading(true);
    try { await generatePDF(item.data, item.history); }
    finally { setPdfLoading(false); }
  }, [item]);

  const handlePageChange = (p) => {
    setLogPage(p);
    document.getElementById("ledger-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-11 h-11 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin" />
    </div>
  );

  /* ── Error ── */
  if (!item) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-sm w-full text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5 text-red-500">
          <Layers size={24} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Record Not Found</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Reference{" "}
          <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">{id}</code>{" "}
          does not exist in the registry.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Registry
        </button>
      </div>
    </div>
  );

  const { data, history } = item;
  const totalLogs = history.length;
  const pagedLogs = history.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);

  /* KPI strip — all 4 top metrics from real API fields */
  const kpis = [
    {
      label: "Available Stock",
      val: data.current_quantity,
      unit: data.unit_of_measurement,
      Icon: Package,
      bg: "bg-blue-50",
      ic: "text-blue-600",
    },
    {
      label: "Material Grade",
      val: data.model_grade,
      unit: "",
      Icon: Activity,
      bg: "bg-purple-50",
      ic: "text-purple-600",
    },
    {
      label: "BIS Compliance",
      val: data.is_bis_standard,
      unit: "",
      Icon: BadgeCheck,
      bg: "bg-green-50",
      ic: "text-green-600",
    },
    {
      label: "Depreciation",
      val: `${data.depreciation_rate}%`,
      unit: "p.a.",
      Icon: TrendingDown,
      bg: "bg-amber-50",
      ic: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Blue accent line (very top, not sticky) ── */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB 0%,#93C5FD 60%,transparent 100%)" }} />

      {/* ══════════════════════════════════════════════════════════════════
          SUB-HEADER — sticky, offset by NAVBAR_HEIGHT_PX
          Change NAVBAR_HEIGHT_PX at the top of this file if it overlaps.
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="sticky z-30 bg-white/92 backdrop-blur border-b border-slate-200"
        style={{ top: NAVBAR_HEIGHT_PX }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3 px-4 sm:px-6 h-14">

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft size={15} />
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-mono text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded leading-none">
                {data.barcode}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                {data.category}
              </span>
            </div>
            <div className="text-[14px] sm:text-[16px] font-bold text-slate-900 tracking-tight truncate leading-tight">
              {data.material_name}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500" style={{ boxShadow: "0 0 0 2px #dcfce7" }} />
              Operational
            </div>
            <button
              onClick={() => navigate(`${BASE}/${id}/action`)}
              className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Zap size={12} />
              <span className="hidden sm:inline">Action</span>
            </button>
            {/* <button
              onClick={() => navigate(`${BASE}/${id}/modify`)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Pencil size={12} />
              <span className="hidden sm:inline">Modify</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* ══ PAGE BODY ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-24 grid grid-cols-1 xl:grid-cols-[1fr_348px] gap-6 items-start">

        {/* ════════ LEFT COLUMN ════════ */}
        <div className="min-w-0 space-y-6">

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {kpis.map((k, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.bg} ${k.ic}`}>
                  <k.Icon size={16} />
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
                <div className="text-[18px] font-bold text-slate-900 tracking-tight leading-none">
                  {k.val}
                  {k.unit && <span className="text-[10px] font-medium text-slate-400 ml-1">{k.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* ── Stock & Identification card ── */}
          <div>
            <SectionHeading Icon={Hash} label="Identification & Stock" />
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Dark header */}
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
                style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)" }}
              >
                <span className="flex items-center gap-2 text-[10.5px] font-bold text-white/60 uppercase tracking-widest">
                  <ClipboardList size={12} className="text-blue-400" />
                  Material Specifications
                </span>
                <span className="font-mono text-[9.5px] text-white/30">ID: {data.material_id}</span>
              </div>

              {/* 3-col quick specs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                {[
                  { label: "Manufacturer / Brand", value: data.brand,                Icon: Tag },
                  { label: "Purchase Date",        value: data.purchase_date,        Icon: Calendar },
                  { label: "Unit of Measure",      value: data.unit_of_measurement,  Icon: Layers },
                ].map((s, i) => (
                  <div key={i} className="px-5 py-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <s.Icon size={10} className="text-blue-500" />
                      {s.label}
                    </div>
                    <div className="text-[14px] font-bold text-slate-900">{s.value ?? "—"}</div>
                  </div>
                ))}
              </div>

              {/* All remaining identification fields */}
              <div className="px-5 pb-2 pt-1 border-t border-slate-100">
                <FieldRow Icon={Box}       label="Material Name"     value={data.material_name} />
                <FieldRow Icon={Tag}       label="Category"          value={data.category} />
                <FieldRow Icon={Hash}      label="Barcode"           value={data.barcode} mono />
                <FieldRow Icon={Activity}  label="Model / Grade"     value={data.model_grade} />
                <FieldRow Icon={Archive}   label="Initial Quantity"  value={`${data.initial_quantity} ${data.unit_of_measurement}`} />
                <FieldRow Icon={Package}   label="Current Quantity"  value={`${data.current_quantity} ${data.unit_of_measurement}`} />
              </div>

              {/* Description */}
              {data.description && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Administrative Description
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed italic">
                      &ldquo;{data.description}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Procurement & Quality card ── */}
          <div>
            <SectionHeading Icon={ShoppingCart} label="Procurement & Quality" />
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-5 py-2">
              <FieldRow Icon={Tag}        label="Supplier / Vendor"    value={data.supplier} />
              <FieldRow Icon={ReceiptText} label="Invoice / Bill No."  value={data.invoice_no} mono />
              <FieldRow Icon={Calendar}   label="Purchase Date"        value={data.purchase_date} />
              <FieldRow Icon={ShoppingCart} label="Purchase Type"      value={data.purchase_type} />
              <FieldRow Icon={ShieldCheck} label="Condition State"     value={data.condition_state} />
              <FieldRow Icon={Calendar}   label="Warranty Period"      value={data.warranty_period} />
              <FieldRow Icon={BadgeCheck} label="BIS Standard"         value={data.is_bis_standard} />
              <FieldRow Icon={TrendingDown} label="Depreciation Rate"  value={`${data.depreciation_rate}% per annum`} />
              <FieldRow Icon={Truck}      label="Returnable Policy"    value={data.is_returnable ? "Active — Returnable" : "Locked — Non-Returnable"} />
              <FieldRow Icon={Calendar}   label="Record Created At"    value={data.created_at} mono />
            </div>
          </div>

          {/* ── Activity Ledger ── */}
          <div>
            <div id="ledger-anchor" className="flex items-center gap-2 mb-3">
              <History size={11} className="text-slate-400 flex-shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Activity Ledger
              </span>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex-shrink-0">
                {totalLogs} {totalLogs === 1 ? "entry" : "entries"}
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {pagedLogs.map((log, idx) => {
                const n = (logPage - 1) * LOGS_PER_PAGE + idx + 1;
                return (
                  <div
                    key={log.log_id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-3 sm:gap-4 items-start">
                      {/* Index */}
                      <div
                        className="flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-white transition-all"
                        style={{ background: "linear-gradient(145deg,#0F172A,#334155)" }}
                      >
                        <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider">LOG</span>
                        <span className="text-[13px] font-bold font-mono leading-none">{String(n).padStart(2, "0")}</span>
                      </div>

                      {/* Body */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[14px] font-bold text-slate-900 tracking-tight">
                            {log.action_type}
                          </span>
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                            +{log.quantity_affected} {data.unit_of_measurement}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-1">
                          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                            <MapPin size={10} className="text-blue-500 flex-shrink-0" />
                            {log.project_site} &bull; {log.location_zone}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                            <Warehouse size={10} className="text-blue-500 flex-shrink-0" />
                            {log.storage_location}
                          </span>
                          <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
                            <HardHat size={10} className="text-blue-500 flex-shrink-0" />
                            {log.handled_by}
                          </span>
                        </div>
                        {log.notes && (
                          <div className="mt-1.5 text-[11.5px] text-slate-500 bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg leading-relaxed">
                            Note: {log.notes}
                          </div>
                        )}
                      </div>

                      {/* Timestamp desktop */}
                      <div className="hidden sm:block flex-shrink-0 text-right pl-4 border-l border-slate-100">
                        <div className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                          Timestamp
                        </div>
                        <div className="font-mono text-[10.5px] font-medium text-slate-600 leading-relaxed">
                          {log.action_date}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp mobile */}
                    <div className="sm:hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-end gap-1">
                      <span className="text-[9px] font-semibold text-slate-300 uppercase tracking-wider">
                        Timestamp:
                      </span>
                      <span className="font-mono text-[10px] font-medium text-slate-500">
                        {log.action_date}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              total={totalLogs}
              page={logPage}
              perPage={LOGS_PER_PAGE}
              onChange={handlePageChange}
            />
          </div>
        </div>

        {/* ════════ RIGHT SIDEBAR ════════ */}
        <div className="flex flex-col gap-5">

          {/* ── Valuation card ── */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg,#0F172A 0%,#0a1628 100%)",
              boxShadow: "0 8px 40px rgba(37,99,235,.18)",
            }}
          >
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.28) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -24, left: -10, width: 90, height: 90, borderRadius: "50%", background: "radial-gradient(circle,rgba(37,99,235,.15) 0%,transparent 70%)", pointerEvents: "none" }} />

            <div className="relative z-10">
              <div className="text-[9.5px] font-bold text-white/30 uppercase tracking-widest mb-2">
                Total Acquisition Value
              </div>
              <div className="font-mono text-[28px] sm:text-[30px] font-medium text-white tracking-tight leading-none mb-1.5">
                &#8377;{Number(data.purchase_price).toLocaleString("en-IN")}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium mb-5">
                <Banknote size={11} /> Purchase cost on record
              </div>

              <div className="border-t border-white/[0.07] divide-y divide-white/[0.06]">
                {[
                  { l: "Vendor Entity",  v: data.supplier },
                  { l: "Bill Reference", v: data.invoice_no },
                  { l: "Purchase Date",  v: data.purchase_date },
                  { l: "Entry Date",     v: data.created_at?.split(" ")[0] },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="text-[9.5px] font-semibold text-white/30 uppercase tracking-wider flex-shrink-0">
                      {r.l}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-white/75 text-right break-all">
                      {r.v ?? "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* PDF Button */}
              <button
                onClick={handlePDF}
                disabled={pdfLoading}
                className="w-full mt-5 py-3 flex items-center justify-center gap-2 rounded-xl text-white text-[12px] font-semibold tracking-wide transition-all disabled:opacity-60 border"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.12)",
                }}
                onMouseEnter={(e) => {
                  if (!pdfLoading) {
                    e.currentTarget.style.background = "#2563EB";
                    e.currentTarget.style.borderColor = "#2563EB";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
              >
                {pdfLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Download size={13} /> Generate PDF Voucher
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Compliance & Audit card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <ShieldCheck size={12} className="text-green-500" />
              Compliance & Quality
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { Icon: ShoppingCart, label: "Purchase Tier",     val: data.purchase_type,  red: false },
                { Icon: Calendar,     label: "Warranty Coverage",  val: data.warranty_period,red: false },
                { Icon: ShieldCheck,  label: "Condition State",    val: data.condition_state,red: false },
                {
                  Icon: Truck,
                  label: "Returnable Policy",
                  val: data.is_returnable ? "Active" : "Locked",
                  red: !data.is_returnable,
                },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <row.Icon size={12} className="text-slate-400" />
                    </div>
                    <span className="text-[11.5px] font-semibold text-slate-600">{row.label}</span>
                  </div>
                  <span
                    className={`text-[9.5px] font-bold px-2.5 py-1 rounded uppercase tracking-wide ${
                      row.red
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.val ?? "—"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[11px] font-semibold text-blue-700 leading-relaxed">
                Compliant with <strong className="font-black">{data.is_bis_standard}</strong>
              </p>
            </div>
          </div>

          {/* ── Quick actions card ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              <Zap size={12} className="text-blue-500" />
              Quick Actions
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`${BASE}/${id}/modify`)}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-left"
              >
                <Pencil size={13} className="text-blue-500 flex-shrink-0" />
                Modify this record
                <ArrowUpRight size={11} className="ml-auto text-slate-300" />
              </button>
              <button
                onClick={() => navigate(`${BASE}/${id}/action`)}
                className="flex items-center gap-2.5 w-full px-4 py-3 rounded-xl border border-slate-200 text-[12px] font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-all text-left"
              >
                <Zap size={13} className="text-slate-500 flex-shrink-0" />
                Perform an action
                <ArrowUpRight size={11} className="ml-auto text-slate-300" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}