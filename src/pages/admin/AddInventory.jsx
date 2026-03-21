import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import SecretGate from "../../SecretGate";

export default function AddInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    barcode: "",
    material_name: "",
    category: "",
    brand: "",
    model_grade: "",
    unit_of_measurement: "",
    initial_quantity: "",
    purchase_date: "",
    purchase_price: "",
    supplier: "",
    invoice_no: "",
    warranty_period: "None",
    depreciation_rate: "10.00",
    purchase_type: "First Hand",
    condition_state: "New",
    is_returnable: false,
    is_bis_standard: "",
    description: "",
    added_by: "System Admin",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validation
    if (!formData.barcode || !formData.material_name || !formData.category) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://capitalspins.com/api/add_inventory.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setMessage({
          type: "success",
          text: `Material created successfully! ID: ${result.material_id}`,
        });
        setTimeout(() => {
          navigate("/admin/ve-supreme-sudo/inventory");
        }, 1500);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to create material" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Steel','Cement','Wood/Timber','Electrical','Plumbing','Aggregate','Tiles/Flooring','Paint/Finishes','Other'];
  const units = ["Pieces", "kg", "liters", "meters", "boxes", "bundles"];

  return (
    <SecretGate>
      <div className="min-h-screen bg-[#F8FAFC] pt-20 md:pt-28 pb-12 px-4 md:px-12 font-sans antialiased text-slate-900">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/ve-supreme-sudo/inventory")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">Add New Material</h1>
              <p className="text-slate-500">Register a new asset to the inventory system</p>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Identification */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Identification & Classification
                </h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Barcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="e.g., BR-20260321-001"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Material Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="material_name"
                  value={formData.material_name}
                  onChange={handleChange}
                  placeholder="e.g., Steel Reinforcement Bar"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Brand / Make</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., TATA Steel"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Model / Grade</label>
                <input
                  type="text"
                  name="model_grade"
                  value={formData.model_grade}
                  onChange={handleChange}
                  placeholder="e.g., Grade A, Model X5"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Unit of Measurement <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit_of_measurement"
                  value={formData.unit_of_measurement}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Section 2: Inventory */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Inventory Details
                </h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Initial Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="initial_quantity"
                  value={formData.initial_quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Depreciation Rate (%)</label>
                <input
                  type="number"
                  name="depreciation_rate"
                  value={formData.depreciation_rate}
                  onChange={handleChange}
                  placeholder="10.00"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Section 3: Purchase Details */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Purchase Information
                </h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Purchase Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Purchase Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Supplier / Vendor</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  placeholder="e.g., ABC Suppliers Ltd"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Invoice / Bill No.</label>
                <input
                  type="text"
                  name="invoice_no"
                  value={formData.invoice_no}
                  onChange={handleChange}
                  placeholder="e.g., INV-2026-001"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Purchase Type</label>
                <select
                  name="purchase_type"
                  value={formData.purchase_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="First Hand">First Hand</option>
                  <option value="Second Hand">Second Hand</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>

              {/* Section 4: Quality & Compliance */}
              <div className="md:col-span-2">
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Quality & Compliance
                </h2>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Condition State</label>
                <select
                  name="condition_state"
                  value={formData.condition_state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>

                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Warranty Period</label>
                <input
                  type="text"
                  name="warranty_period"
                  value={formData.warranty_period}
                  onChange={handleChange}
                  placeholder="e.g., 12 months"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">BIS Standard</label>
                <input
                  type="text"
                  name="is_bis_standard"
                  value={formData.is_bis_standard}
                  onChange={handleChange}
                  placeholder="e.g., IS 1786:2015"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_returnable"
                  checked={formData.is_returnable}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-2"
                />
                <label className="text-sm font-bold text-slate-700">Returnable Material</label>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Add any additional details..."
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/admin/ve-supreme-sudo/inventory")}
                className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="h-5 w-5" />
                {loading ? "Creating..." : "Create Material"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SecretGate>
  );
}
