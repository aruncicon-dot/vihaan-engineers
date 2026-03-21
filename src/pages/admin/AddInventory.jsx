import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  ArrowLeft, Save, AlertCircle, CheckCircle, Download,
  Hash, Package, ShoppingCart, ShieldCheck, FileText,
  ExternalLink, Copy, Check, Archive, X, Tag, Layers,
  Calendar, Banknote, Truck, BadgeCheck, TrendingDown,
} from "lucide-react";
import SecretGate from "../../SecretGate";

/* ─── URL that the QR code will encode ─────────────────────────────────── */
const MATERIAL_URL = (id) =>
  `https://www.vihaan-engineers.in/admin/ve-supreme-sudo/inventory/${id}`;

/* ══════════════════════════════════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════════════════════════════════ */
function SuccessScreen({ result, barcode, materialName, navigate }) {
  const canvasRef      = useRef(null);
  const [copied, setCopied] = useState(false);
  const url = MATERIAL_URL(result.material_id);

  /* Generate QR code into canvas */
  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 240,
      margin: 2,
      color: { dark: "#0F172A", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    });
  }, [url]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr-${barcode}-${result.material_id}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">

        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">

          {/* Accent */}
          <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#93C5FD 60%,transparent)" }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-5 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", boxShadow: "0 4px 20px rgba(22,163,74,.15)" }}
            >
              <CheckCircle size={30} className="text-green-600" />
            </div>
            <h2 className="text-[22px] font-bold text-slate-900 mb-1">Material Registered!</h2>
            <p className="text-sm text-slate-500 mb-3 font-medium">{materialName}</p>
            <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-mono font-bold px-3 py-1.5 rounded-full">
              <Hash size={10} /> ID: {result.material_id} &nbsp;·&nbsp; {barcode}
            </div>
          </div>

          {/* QR section */}
          <div className="mx-5 mb-5 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            {/* Warning strip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border-b border-amber-200">
              <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                Download now — QR code is not saved anywhere
              </p>
            </div>

            {/* QR canvas */}
            <div className="flex flex-col items-center py-6 px-6 gap-4">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <canvas ref={canvasRef} className="block rounded-xl" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Scan to open material record</p>
                <p className="font-mono text-[11px] text-slate-500 break-all">{url}</p>
              </div>
            </div>

            {/* Download */}
            <div className="px-5 pb-5">
              <button
                onClick={downloadQR}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 14px rgba(37,99,235,.25)" }}
              >
                <Download size={14} /> Download QR Code PNG
              </button>
            </div>
          </div>

          {/* URL copy */}
          <div className="mx-5 mb-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Material Record URL</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <span className="flex-1 text-[11px] font-mono text-slate-600 truncate">{url}</span>
              <button
                onClick={copyUrl}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                {copied
                  ? <Check size={12} className="text-green-600" />
                  : <Copy size={12} className="text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-6 flex flex-col gap-2.5">
            <button
              onClick={() => navigate(`/admin/ve-supreme-sudo/inventory/${result.material_id}`)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)" }}
            >
              <ExternalLink size={13} /> View Material Record
            </button>
            <button
              onClick={() => navigate("/admin/ve-supreme-sudo/inventory")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Back to Inventory
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
          The QR code encodes the full URL above. Scanning it with any phone camera<br />
          will open the material record directly.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   FORM HELPERS
══════════════════════════════════════════════════════════════════════════ */

/* Input / Select shared class */
const base =
  "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl " +
  "placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/25 " +
  "focus:border-blue-400 transition-all";

function Lbl({ children, req }) {
  return (
    <label className="block text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {children}{req && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Field({ label, req, children, hint }) {
  return (
    <div>
      <Lbl req={req}>{label}</Lbl>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

/* Section divider row — spans all columns */
function Sec({ Icon, label, accent }) {
  return (
    <div className="col-span-full flex items-center gap-3 pt-2 pb-1">
      <div className="h-5 w-0.5 rounded-full flex-shrink-0" style={{ background: accent }} />
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + "18", color: accent }}
      >
        <Icon size={14} />
      </div>
      <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

/* Pill toggle group */
function PillGroup({ options, value, onChange, colorMap }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        const activeClass = colorMap?.[opt] ?? "bg-blue-600 border-blue-600 text-white";
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
              active ? activeClass : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* Toggle switch */
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
        on ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-500"
      }`}
    >
      <div className={`relative w-10 h-5 rounded-full flex-shrink-0 transition-colors ${on ? "bg-blue-600" : "bg-slate-200"}`}>
        <div
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
          style={{ left: on ? "calc(100% - 18px)" : "2px" }}
        />
      </div>
      <span>{on ? "Returnable" : "Non-Returnable"}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════════════════ */
export default function AddInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(null);

  const [fd, setFd] = useState({
    barcode:             "",
    material_name:       "",
    category:            "",
    brand:               "",
    model_grade:         "",
    unit_of_measurement: "",
    initial_quantity:    "",
    purchase_date:       "",
    purchase_price:      "",
    supplier:            "",
    invoice_no:          "",
    warranty_period:     "None",
    depreciation_rate:   "10.00",
    purchase_type:       "First Hand",
    condition_state:     "New",
    is_returnable:       false,
    is_bis_standard:     "",
    description:         "",
    added_by:            "System Admin",
  });

  const set = (name) => (e) =>
    setFd((p) => ({ ...p, [name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const setVal = (name, val) => setFd((p) => ({ ...p, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fd.barcode.trim())          { setError("Barcode is required."); return; }
    if (!fd.material_name.trim())    { setError("Material name is required."); return; }
    if (!fd.category)                { setError("Category is required."); return; }
    if (!fd.unit_of_measurement)     { setError("Unit of measurement is required."); return; }
    if (!fd.initial_quantity)        { setError("Initial quantity is required."); return; }
    if (!fd.purchase_date)           { setError("Purchase date is required."); return; }
    if (!fd.purchase_price)          { setError("Purchase price is required."); return; }

    setLoading(true);
    try {
      const res = await fetch("https://capitalspins.com/api/add_inventory.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fd),
      });
      const result = await res.json();
      if (result.status === "success") {
        setSuccess(result);
      } else {
        setError(result.message || "Failed to register material.");
      }
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <SecretGate>
        <SuccessScreen
          result={success}
          barcode={fd.barcode}
          materialName={fd.material_name}
          navigate={navigate}
        />
      </SecretGate>
    );
  }

  const categories = [
    "Steel", "Cement", "Wood/Timber", "Electrical", "Plumbing",
    "Aggregate", "Tiles/Flooring", "Paint/Finishes", "Pipes & Fittings",
    "Hardware", "Other",
  ];
  const units = [
    "Pieces", "Bags", "Kg", "Tonnes", "Litres",
    "Metres", "Feet", "Boxes", "Bundles", "Rolls", "Sets",
  ];

  return (
    <SecretGate>
      <div className="min-h-screen bg-slate-50">

        {/* Blue stripe */}
        <div style={{ height: 3, background: "linear-gradient(90deg,#2563EB,#93C5FD 60%,transparent)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 pb-24">

          {/* ── Page title ── */}
          <div className="flex items-center gap-3 mb-7">
            <button
              onClick={() => navigate("/admin/ve-supreme-sudo/inventory")}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Register New Material
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">Fill in all details to add a material to the inventory</p>
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-700 flex-1">{error}</p>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

              {/* Form header */}
              <div
                className="px-7 py-5 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: "linear-gradient(135deg,#0F172A 0%,#1E293B 100%)" }}
              >
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">New Entry</p>
                  <p className="text-base font-bold text-white tracking-tight">Material Registration Form</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  <Archive size={10} /> Inventory Registry
                </div>
              </div>

              {/* ── Grid body ── */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">

                  {/* ══════════════ SECTION 1: Identification ══════════════ */}
                  <Sec Icon={Hash} label="Identification & Classification" accent="#2563EB" />

                  <Field label="Barcode" req hint="Unique identifier printed on the material label">
                    <input type="text" value={fd.barcode} onChange={set("barcode")} placeholder="e.g., MAT-ST-001" className={base} />
                  </Field>

                  <Field label="Material Name" req>
                    <input type="text" value={fd.material_name} onChange={set("material_name")} placeholder="e.g., TMT Steel Bar Fe500D" className={base} />
                  </Field>

                  <Field label="Category" req>
                    <select value={fd.category} onChange={set("category")} className={base}>
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Brand / Make">
                    <input type="text" value={fd.brand} onChange={set("brand")} placeholder="e.g., JSW Steel, Finolex" className={base} />
                  </Field>

                  <Field label="Model / Grade">
                    <input type="text" value={fd.model_grade} onChange={set("model_grade")} placeholder="e.g., Fe500D, SDR 11" className={base} />
                  </Field>

                  <Field label="Unit of Measurement" req>
                    <select value={fd.unit_of_measurement} onChange={set("unit_of_measurement")} className={base}>
                      <option value="">Select unit</option>
                      {units.map((u) => <option key={u}>{u}</option>)}
                    </select>
                  </Field>

                  {/* ══════════════ SECTION 2: Inventory ══════════════ */}
                  <Sec Icon={Package} label="Inventory Details" accent="#7C3AED" />

                  <Field label="Initial Quantity" req>
                    <input type="number" value={fd.initial_quantity} onChange={set("initial_quantity")} placeholder="0" min="0" step="0.01" className={base} />
                  </Field>

                  <Field label="Depreciation Rate (%)" hint="Annual depreciation percentage">
                    <input type="number" value={fd.depreciation_rate} onChange={set("depreciation_rate")} placeholder="10.00" step="0.01" min="0" max="100" className={base} />
                  </Field>

                  {/* ══════════════ SECTION 3: Purchase ══════════════ */}
                  <Sec Icon={ShoppingCart} label="Purchase Information" accent="#16A34A" />

                  <Field label="Purchase Date" req>
                    <input type="date" value={fd.purchase_date} onChange={set("purchase_date")} className={base} />
                  </Field>

                  <Field label="Purchase Price (₹)" req>
                    <input type="number" value={fd.purchase_price} onChange={set("purchase_price")} placeholder="0.00" step="0.01" min="0" className={base} />
                  </Field>

                  <Field label="Supplier / Vendor">
                    <input type="text" value={fd.supplier} onChange={set("supplier")} placeholder="e.g., Ramesh Steel Traders" className={base} />
                  </Field>

                  <Field label="Invoice / Bill No.">
                    <input type="text" value={fd.invoice_no} onChange={set("invoice_no")} placeholder="e.g., INV-2026-001" className={base} />
                  </Field>

                  {/* Purchase Type pills — spans 2 cols on large */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Lbl>Purchase Type</Lbl>
                    <div className="flex gap-2">
                      {["First Hand", "Second Hand", "Refurbished"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setVal("purchase_type", opt)}
                          className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                            fd.purchase_type === opt
                              ? "bg-green-600 border-green-600 text-white"
                              : "bg-white text-slate-500 border-slate-200 hover:border-green-300 hover:text-green-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ══════════════ SECTION 4: Quality ══════════════ */}
                  <Sec Icon={ShieldCheck} label="Quality & Compliance" accent="#D97706" />

                  {/* Condition pills — spans full */}
                  <div className="col-span-full">
                    <Lbl>Condition State</Lbl>
                    <PillGroup
                      options={["New", "Good", "Fair", "Poor", "Damaged"]}
                      value={fd.condition_state}
                      onChange={(v) => setVal("condition_state", v)}
                      colorMap={{
                        New:     "bg-green-600 border-green-600 text-white",
                        Good:    "bg-blue-600 border-blue-600 text-white",
                        Fair:    "bg-amber-500 border-amber-500 text-white",
                        Poor:    "bg-orange-500 border-orange-500 text-white",
                        Damaged: "bg-red-600 border-red-600 text-white",
                      }}
                    />
                  </div>

                  <Field label="Warranty Period">
                    <input type="text" value={fd.warranty_period} onChange={set("warranty_period")} placeholder="e.g., 12 months, None" className={base} />
                  </Field>

                  <Field label="BIS Standard">
                    <input type="text" value={fd.is_bis_standard} onChange={set("is_bis_standard")} placeholder="e.g., IS 1786:2008" className={base} />
                  </Field>

                  <div>
                    <Lbl>Returnable Material</Lbl>
                    <Toggle on={fd.is_returnable} onToggle={() => setVal("is_returnable", !fd.is_returnable)} />
                  </div>

                  {/* Description — full width */}
                  <div className="col-span-full">
                    <Lbl>Description</Lbl>
                    <textarea
                      value={fd.description}
                      onChange={set("description")}
                      placeholder="Add any additional notes or details about this material..."
                      rows={3}
                      className={`${base} resize-none`}
                    />
                  </div>

                </div>
              </div>

              {/* ── Footer actions ── */}
              <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 order-last sm:order-first">
                  Fields marked <span className="text-red-400 font-bold">*</span> are required ·
                  A QR code linking to this record will be generated on success
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/ve-supreme-sudo/inventory")}
                    className="flex-1 sm:flex-none px-5 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
                    style={{
                      background: loading ? "#93C5FD" : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                      boxShadow: loading ? "none" : "0 4px 14px rgba(37,99,235,.3)",
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registering…
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Register Material
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SecretGate>
  );
}