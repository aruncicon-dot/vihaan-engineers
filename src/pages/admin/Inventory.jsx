import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, Package, ChevronRight, ChevronLeft, 
  ArrowUpDown, Filter, Calendar, X, MoreHorizontal,
  LayoutGrid, List, HardHat, Trash2, AlertCircle, CheckCircle
} from "lucide-react";
import SecretGate from "../../SecretGate";
import { useNavigate } from "react-router-dom";

export default function InventoryManagementPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: 'material_name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState({ type: "", text: "" });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("https://capitalspins.com/api/get_inventory.php")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "success") setInventory(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const processedData = useMemo(() => {
    let filtered = [...inventory];
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        const pDate = new Date(item.purchase_date);
        return pDate >= new Date(dateRange.start) && pDate <= new Date(dateRange.end);
      });
    }
    filtered.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === 'current_quantity') {
        valA = parseFloat(valA); valB = parseFloat(valB);
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [inventory, searchTerm, selectedCategory, sortConfig, dateRange]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const categories = ["All", ...new Set(inventory.map(i => i.category))];

  const handleDelete = async (materialId) => {
    setDeleting(true);
    setDeleteMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "https://capitalspins.com/api/add_inventory.php",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ material_id: materialId }),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setDeleteMessage({
          type: "success",
          text: "Material deleted successfully!",
        });
        // Remove from list
        setInventory(inventory.filter(item => item.material_id !== materialId));
        setDeleteConfirm(null);
        setTimeout(() => setDeleteMessage({ type: "", text: "" }), 3000);
      } else {
        setDeleteMessage({ type: "error", text: result.message || "Failed to delete" });
      }
    } catch (error) {
      setDeleteMessage({ type: "error", text: error.message || "Network error" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SecretGate>
      <div className="min-h-screen bg-[#F8FAFC] pt-20 md:pt-28 pb-12 px-4 md:px-12 font-sans antialiased text-slate-900">
        
        {/* Delete Message */}
        {deleteMessage.text && (
          <div
            className={`max-w-7xl mx-auto mb-6 p-4 rounded-xl flex items-start gap-3 ${
              deleteMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {deleteMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <span>{deleteMessage.text}</span>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Delete Material</h2>
              </div>
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete <strong>{deleteConfirm.material_name}</strong>?
              </p>
              <p className="text-sm text-slate-500 mb-6">
                This action cannot be undone. All associated history will also be deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.material_id)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header: Dynamic Sizing for Mobile */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
                  <HardHat className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Operations Hub</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">Inventory Registry</h1>
              <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl">
                Real-time asset tracking and procurement analytics for Vihaan Engineers.
              </p>
            </div>
            
<button
      onClick={() => navigate("/admin/ve-supreme-sudo/inventory/add")}
      className="w-full lg:w-auto flex items-center justify-center gap-3 rounded-xl bg-slate-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-blue-600 hover:scale-[1.02] active:scale-95 shadow-2xl shadow-slate-200"
    >
      Add New Asset
    </button>
          </div>

          {/* MNC Control Bar: Responsive Flex */}
          <div className="mt-10 flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search materials, serials, or brands..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm rounded-xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-4">
              <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex-1 md:flex-none">
                <Filter className="h-4 w-4 text-slate-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-transparent outline-none min-w-30"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-4 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex-1 md:flex-none overflow-x-auto whitespace-nowrap">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="text-[10px] font-bold text-slate-700 outline-none bg-transparent"
                />
                <span className="text-slate-300">—</span>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="text-[10px] font-bold text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Display Logic: Desktop Table vs Mobile Cards */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop Version */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-100/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reference</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 cursor-pointer" onClick={() => setSortConfig({key: 'material_name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Material</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Class</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quality</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center font-mono text-[10px] uppercase tracking-[0.5em] text-slate-300">Synchronizing Global Asset Stream...</td></tr>
                ) : paginatedData.map((item) => (
                  <tr key={item.material_id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-6 font-mono text-[10px] text-slate-400 italic">ID-{String(item.material_id).padStart(4, '0')}</td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-bold text-slate-900 leading-none mb-1">{item.material_name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{item.barcode}</p>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{item.category}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <p className="text-sm font-black text-slate-900">{item.current_quantity}</p>
                      <p className="text-[9px] font-bold uppercase text-slate-400">{item.unit_of_measurement}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 ${item.condition_state === 'New' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${item.condition_state === 'New' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <span className="text-[9px] font-black uppercase">{item.condition_state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/admin/ve-supreme-sudo/inventory/${item.material_id}`} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all rounded-lg shadow-sm">
                          Inspect <ChevronRight className="h-3 w-3" />
                        </a>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-lg shadow-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Version (Hidden on PC) */}
          <div className="lg:hidden space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase text-xs">Loading Assets...</div>
            ) : paginatedData.map((item) => (
              <div key={item.material_id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm active:scale-[0.98] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-tighter italic">#{String(item.material_id).padStart(4, '0')}</span>
                    <h3 className="text-base font-bold text-slate-900">{item.material_name}</h3>
                    <p className="text-[10px] font-mono text-slate-400">{item.barcode}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.condition_state === 'New' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                    {item.condition_state}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Category</p>
                    <p className="text-xs font-bold text-slate-700">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Stock</p>
                    <p className="text-xs font-black text-slate-900">{item.current_quantity} <span className="text-[9px] text-slate-400">{item.unit_of_measurement}</span></p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <a 
                    href={`/admin/ve-supreme-sudo/inventory/${item.material_id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600"
                  >
                    Inspect <ChevronRight className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* MNC Pagination */}
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 order-2 md:order-1">
              Registry: {processedData.length} active assets found
            </p>
            
            <div className="flex items-center gap-2 order-1 md:order-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 shadow-sm transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 h-10 shadow-sm">
                <span className="text-[11px] font-black text-slate-900 px-2">{currentPage}</span>
                <span className="text-slate-300 text-[10px] mx-1">/</span>
                <span className="text-[11px] font-bold text-slate-400 px-2">{totalPages}</span>
              </div>

              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 shadow-sm transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </SecretGate>
  );
}