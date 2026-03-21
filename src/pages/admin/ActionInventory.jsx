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
    Package,
} from "lucide-react";
import SecretGate from "../../SecretGate";

export default function ActionInventory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [material, setMaterial] = useState(null);
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [editingHistory, setEditingHistory] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        action_type: "Received",
        quantity_affected: "",
        project_site: "",
        location_zone: "",
        storage_location: "",
        handled_by: "System Admin",
        notes: "",
    });

    // Fetch material and history
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `https://capitalspins.com/api/get_inventory.php?id=${id}`
                );
                const result = await response.json();
                if (result.status === "success" && result.data) {
                    setMaterial(result.data[0]);
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

        fetchData();
        fetchHistory();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(
                "https://capitalspins.com/api/add_history.php",
                {
                    method: editingHistory ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...(editingHistory && { log_id: editingHistory.log_id }),
                        material_id: id,
                        ...formData,
                    }),
                }
            );

            const result = await response.json();

            if (result.status === "success") {
                setMessage({
                    type: "success",
                    text: editingHistory ? "History updated successfully!" : "History entry added!",
                });
                setShowForm(false);
                setEditingHistory(null);
                setFormData({
                    action_type: "Received",
                    quantity_affected: "",
                    project_site: "",
                    location_zone: "",
                    storage_location: "",
                    handled_by: "System Admin",
                    notes: "",
                });
                // Refresh history
                const historyResponse = await fetch(
                    "https://capitalspins.com/api/add_history.php",
                    { method: "GET" }
                );
                const historyResult = await historyResponse.json();
                if (historyResult.status === "success") {
                    const filtered = historyResult.data.filter(
                        (h) => parseInt(h.material_id) === parseInt(id)
                    );
                    setHistory(filtered);
                }
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        }
    };

    const handleEdit = (item) => {
        setEditingHistory(item);
        setFormData({
            action_type: item.action_type,
            quantity_affected: item.quantity_affected,
            project_site: item.project_site || "",
            location_zone: item.location_zone || "",
            storage_location: item.storage_location || "",
            handled_by: item.handled_by,
            notes: item.notes || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (logId) => {
        if (!confirm("Delete this history entry? This action cannot be undone.")) return;

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
                setMessage({ type: "success", text: "History entry deleted successfully!" });
                // Refresh history
                const historyResponse = await fetch(
                    "https://capitalspins.com/api/add_history.php",
                    { method: "GET" }
                );
                const historyResult = await historyResponse.json();
                if (historyResult.status === "success") {
                    const filtered = historyResult.data.filter(
                        (h) => parseInt(h.material_id) === parseInt(id)
                    );
                    setHistory(filtered);
                }
                setTimeout(() => setMessage({ type: "", text: "" }), 3000);
            } else {
                setMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            setMessage({ type: "error", text: error.message });
        }
    };

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
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/admin/ve-supreme-sudo/inventory/${id}`)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold">Manage Movement & History</h1>
                            <p className="text-slate-500">
                                {material?.material_name} ({material?.barcode})
                            </p>
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

                    {/* Material Card */}
                    {material && (
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Material ID
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        #{String(material.material_id).padStart(4, "0")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Current Stock
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {material.current_quantity} <span className="text-sm text-slate-500">{material.unit_of_measurement}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Condition
                                    </p>
                                    <p className="text-xl font-bold">
                                        <span className={`inline-block px-3 py-1 rounded-lg text-sm ${material.condition_state === "New"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-amber-50 text-amber-700"
                                            }`}>
                                            {material.condition_state}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Category
                                    </p>
                                    <p className="text-lg font-bold text-blue-600">{material.category}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Entry Button */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => {
                                setEditingHistory(null);
                                setFormData({
                                    action_type: "Received",
                                    quantity_affected: "",
                                    project_site: "",
                                    location_zone: "",
                                    storage_location: "",
                                    handled_by: "System Admin",
                                    notes: "",
                                });
                                setShowForm(!showForm);
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg"
                        >
                            <Plus className="h-5 w-5" />
                            {showForm ? "Cancel" : "Add Movement"}
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg mb-8"
                        >
                            <h2 className="text-xl font-bold text-slate-900 mb-6">
                                {editingHistory ? "Edit Movement Entry" : "Record New Movement"}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Action Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="action_type"
                                        value={formData.action_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
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
                                        Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity_affected"
                                        value={formData.quantity_affected}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        value={formData.project_site}
                                        onChange={handleChange}
                                        placeholder="e.g., Capital Spins HQ"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Location Zone
                                    </label>
                                    <input
                                        type="text"
                                        name="location_zone"
                                        value={formData.location_zone}
                                        onChange={handleChange}
                                        placeholder="e.g., Zone A, First Floor"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Storage Location
                                    </label>
                                    <input
                                        type="text"
                                        name="storage_location"
                                        value={formData.storage_location}
                                        onChange={handleChange}
                                        placeholder="e.g., Rack 5, Shelf 3"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Handled By
                                    </label>
                                    <input
                                        type="text"
                                        name="handled_by"
                                        value={formData.handled_by}
                                        onChange={handleChange}
                                        placeholder="Employee name"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Add any additional details about this movement..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Save className="h-5 w-5" />
                                    {editingHistory ? "Update" : "Record"} Movement
                                </button>
                            </div>
                        </form>
                    )}

                    {/* History Table */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Movement History</h2>

                        {history.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 font-bold">No movement history yet</p>
                                <p className="text-slate-400 text-sm">Start tracking movements for this material</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-bold text-slate-600">Date & Time</th>
                                            <th className="px-4 py-3 font-bold text-slate-600">Action</th>
                                            <th className="px-4 py-3 font-bold text-slate-600">Quantity</th>
                                            <th className="px-4 py-3 font-bold text-slate-600">Project Site</th>
                                            <th className="px-4 py-3 font-bold text-slate-600">Location</th>
                                            <th className="px-4 py-3 font-bold text-slate-600">Handled By</th>
                                            <th className="px-4 py-3 font-bold text-slate-600 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {history.map((item) => (
                                            <tr key={item.log_id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-[10px] font-mono text-slate-500">
                                                    {item.action_date
                                                        ? new Date(item.action_date).toLocaleString("en-IN")
                                                        : "—"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg ${item.action_type === "Received"
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : item.action_type === "Issued"
                                                                ? "bg-red-50 text-red-700"
                                                                : "bg-blue-50 text-blue-700"
                                                        }`}>
                                                        {item.action_type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-900">
                                                    {item.quantity_affected}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {item.project_site || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {item.storage_location || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600">
                                                    {item.handled_by || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Edit2 className="h-3 w-3" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.log_id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-xs font-bold"
                                                    >
                                                        <Trash2 className="h-3 w-3" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </SecretGate>
    );
}