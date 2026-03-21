import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Save,
    AlertCircle,
    CheckCircle,
    Trash2,
    Edit2,
    Plus,
} from "lucide-react";
import SecretGate from "../../SecretGate";

export default function ModifyInventory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [material, setMaterial] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistoryForm, setShowHistoryForm] = useState(false);
    const [editingHistory, setEditingHistory] = useState(null);

    const [formData, setFormData] = useState({
        barcode: "",
        material_name: "",
        category: "",
        brand: "",
        model_grade: "",
        unit_of_measurement: "",
        initial_quantity: "",
        current_quantity: "",
        purchase_date: "",
        purchase_price: "",
        supplier: "",
        invoice_no: "",
        warranty_period: "",
        depreciation_rate: "",
        purchase_type: "",
        condition_state: "",
        is_returnable: false,
        is_bis_standard: "",
        description: "",
    });

    const [historyFormData, setHistoryFormData] = useState({
        action_type: "Received",
        quantity_affected: "",
        project_site: "",
        location_zone: "",
        storage_location: "",
        handled_by: "System Admin",
        notes: "",
    });

    // Fetch material data
    useEffect(() => {
        const fetchMaterial = async () => {
            try {
                const response = await fetch(
                    `https://capitalspins.com/api/get_inventory.php?id=${id}`
                );
                const result = await response.json();
                if (result.status === "success" && result.data) {
                    const mat = result.data[0];
                    setMaterial(mat);
                    setFormData({
                        barcode: mat.barcode || "",
                        material_name: mat.material_name || "",
                        category: mat.category || "",
                        brand: mat.brand || "",
                        model_grade: mat.model_grade || "",
                        unit_of_measurement: mat.unit_of_measurement || "",
                        initial_quantity: mat.initial_quantity || "",
                        current_quantity: mat.current_quantity || "",
                        purchase_date: mat.purchase_date || "",
                        purchase_price: mat.purchase_price || "",
                        supplier: mat.supplier || "",
                        invoice_no: mat.invoice_no || "",
                        warranty_period: mat.warranty_period || "",
                        depreciation_rate: mat.depreciation_rate || "",
                        purchase_type: mat.purchase_type || "",
                        condition_state: mat.condition_state || "",
                        is_returnable: mat.is_returnable ? true : false,
                        is_bis_standard: mat.is_bis_standard || "",
                        description: mat.description || "",
                    });
                }
                setLoading(false);
            } catch (error) {
                setMessage({
                    type: "error",
                    text: "Failed to load material details",
                });
                setLoading(false);
            }
        };

        fetchMaterial();
        fetchHistory();
    }, [id]);

    // Fetch history
    const fetchHistory = async () => {
        try {
            const response = await fetch(
                "https://capitalspins.com/api/add_history.php",
                { method: "GET" }
            );
            const result = await response.json();
            if (result.status === "success") {
                const filtered = result.data.filter(
                    (h) => parseInt(h.material_id) === parseInt(id)
                );
                setHistory(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleHistoryChange = (e) => {
        const { name, value } = e.target;
        setHistoryFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(
                "https://capitalspins.com/api/add_inventory.php",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        material_id: id,
                        ...formData,
                        updated_by: "System Admin",
                    }),
                }
            );

            const result = await response.json();

            if (result.status === "success") {
                setMessage({
                    type: "success",
                    text: "Material updated successfully!",
                });
                setTimeout(() => {
                    navigate(`/admin/ve-supreme-sudo/inventory/${id}`);
                }, 1500);
            } else {
                setMessage({ type: "error", text: result.message || "Failed to update" });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Network error" });
        } finally {
            setSaving(false);
        }
    };

    const handleAddHistory = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "https://capitalspins.com/api/add_history.php",
                {
                    method: editingHistory ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...(editingHistory && { log_id: editingHistory.log_id }),
                        material_id: id,
                        ...historyFormData,
                    }),
                }
            );

            const result = await response.json();

            if (result.status === "success") {
                setMessage({
                    type: "success",
                    text: editingHistory ? "History updated!" : "History entry added!",
                });
                setShowHistoryForm(false);
                setEditingHistory(null);
                setHistoryFormData({
                    action_type: "Received",
                    quantity_affected: "",
                    project_site: "",
                    location_zone: "",
                    storage_location: "",
                    handled_by: "System Admin",
                    notes: "",
                });
                fetchHistory();
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const handleDeleteHistory = async (logId) => {
        if (!confirm("Delete this history entry?")) return;

        try {
            const response = await fetch(
                "https://capitalspins.com/api/add_history.php",
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ log_id: logId }),
                }
            );

            const result = await response.json();

            if (result.status === "success") {
                setMessage({ type: "success", text: "History entry deleted!" });
                fetchHistory();
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const handleEditHistory = (item) => {
        setEditingHistory(item);
        setHistoryFormData({
            action_type: item.action_type,
            quantity_affected: item.quantity_affected,
            project_site: item.project_site || "",
            location_zone: item.location_zone || "",
            storage_location: item.storage_location || "",
            handled_by: item.handled_by,
            notes: item.notes || "",
        });
        setShowHistoryForm(true);
    };

    const categories = ["Hardware", "Electronics", "Tools", "Materials", "Equipment"];
    const units = ["Pieces", "kg", "liters", "meters", "boxes", "bundles"];

    if (loading) {
        return (
            <SecretGate>
                <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500 font-bold">Loading material...</p>
                    </div>
                </div>
            </SecretGate>
        );
    }

    return (
        <SecretGate>
            <div className="min-h-screen bg-[#F8FAFC] pt-20 md:pt-28 pb-12 px-4 md:px-12 font-sans antialiased text-slate-900">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/admin/ve-supreme-sudo/inventory/${id}`)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold">Modify Material</h1>
                            <p className="text-slate-500">Update {formData.material_name}</p>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div
                            className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${message.type === "success"
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

                    {/* Material Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg mb-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Identification */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                    Material Details
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Barcode
                                </label>
                                <input
                                    type="text"
                                    name="barcode"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Material Name
                                </label>
                                <input
                                    type="text"
                                    name="material_name"
                                    value={formData.material_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Brand
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Model / Grade
                                </label>
                                <input
                                    type="text"
                                    name="model_grade"
                                    value={formData.model_grade}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Unit of Measurement
                                </label>
                                <select
                                    name="unit_of_measurement"
                                    value={formData.unit_of_measurement}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                    Stock Information
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Initial Quantity
                                </label>
                                <input
                                    type="number"
                                    name="initial_quantity"
                                    value={formData.initial_quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Current Quantity
                                </label>
                                <input
                                    type="number"
                                    name="current_quantity"
                                    value={formData.current_quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Depreciation Rate (%)
                                </label>
                                <input
                                    type="number"
                                    name="depreciation_rate"
                                    value={formData.depreciation_rate}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Purchase Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                    Purchase Information
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    name="purchase_date"
                                    value={formData.purchase_date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Purchase Price
                                </label>
                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleChange}
                                    step="0.01"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Supplier
                                </label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Invoice No.
                                </label>
                                <input
                                    type="text"
                                    name="invoice_no"
                                    value={formData.invoice_no}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Purchase Type
                                </label>
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

                            {/* Quality Section */}
                            <div className="md:col-span-2">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                                    Quality & Compliance
                                </h2>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Condition State
                                </label>
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
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Warranty Period
                                </label>
                                <input
                                    type="text"
                                    name="warranty_period"
                                    value={formData.warranty_period}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    BIS Standard
                                </label>
                                <input
                                    type="text"
                                    name="is_bis_standard"
                                    value={formData.is_bis_standard}
                                    onChange={handleChange}
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
                                <label className="text-sm font-bold text-slate-700">Returnable</label>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/ve-supreme-sudo/inventory/${id}`)}
                                className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Save className="h-5 w-5" />
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    {/* History Section */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Activity History</h2>
                            <button
                                onClick={() => {
                                    setEditingHistory(null);
                                    setHistoryFormData({
                                        action_type: "Received",
                                        quantity_affected: "",
                                        project_site: "",
                                        location_zone: "",
                                        storage_location: "",
                                        handled_by: "System Admin",
                                        notes: "",
                                    });
                                    setShowHistoryForm(!showHistoryForm);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Add Entry
                            </button>
                        </div>

                        {/* History Form */}
                        {showHistoryForm && (
                            <form
                                onSubmit={handleAddHistory}
                                className="bg-slate-50 border border-slate-200 p-6 rounded-lg mb-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Action Type
                                        </label>
                                        <select
                                            name="action_type"
                                            value={historyFormData.action_type}
                                            onChange={handleHistoryChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Received">Received (Stock In)</option>
                                            <option value="Issued">Issued (Stock Out)</option>
                                            <option value="Transferred">Transferred</option>
                                            <option value="Shifted to Storage">Shifted to Storage</option>
                                            <option value="Shifted to Site">Shifted to Site</option>
                                            <option value="Used/Installed">Used / Installed</option>
                                            <option value="Returned to Vendor">Returned to Vendor</option>
                                            <option value="Damaged/Scrapped">Damaged / Scrapped</option>
                                            <option value="Returned">Returned</option>
                                            <option value="Adjusted">Adjusted</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity_affected"
                                            value={historyFormData.quantity_affected}
                                            onChange={handleHistoryChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Project Site
                                        </label>
                                        <input
                                            type="text"
                                            name="project_site"
                                            value={historyFormData.project_site}
                                            onChange={handleHistoryChange}
                                            placeholder="e.g., Site A"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Location Zone
                                        </label>
                                        <input
                                            type="text"
                                            name="location_zone"
                                            value={historyFormData.location_zone}
                                            onChange={handleHistoryChange}
                                            placeholder="e.g., Zone B"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Storage Location
                                        </label>
                                        <input
                                            type="text"
                                            name="storage_location"
                                            value={historyFormData.storage_location}
                                            onChange={handleHistoryChange}
                                            placeholder="e.g., Rack 5"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Handled By
                                        </label>
                                        <input
                                            type="text"
                                            name="handled_by"
                                            value={historyFormData.handled_by}
                                            onChange={handleHistoryChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            name="notes"
                                            value={historyFormData.notes}
                                            onChange={handleHistoryChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowHistoryForm(false)}
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {editingHistory ? "Update" : "Add"} Entry
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* History Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-slate-600">Date</th>
                                        <th className="px-4 py-3 font-bold text-slate-600">Action</th>
                                        <th className="px-4 py-3 font-bold text-slate-600">Quantity</th>
                                        <th className="px-4 py-3 font-bold text-slate-600">Location</th>
                                        <th className="px-4 py-3 font-bold text-slate-600">Handled By</th>
                                        <th className="px-4 py-3 font-bold text-slate-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                                No history entries yet
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((item) => (
                                            <tr key={item.log_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-[10px] font-mono text-slate-500">
                                                    {item.action_date
                                                        ? new Date(item.action_date).toLocaleDateString("en-IN")
                                                        : "—"}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-900">
                                                    {item.action_type}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700">
                                                    {item.quantity_affected}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {item.storage_location || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {item.handled_by || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEditHistory(item)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Edit2 className="h-3 w-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHistory(item.log_id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </SecretGate>
    );
}