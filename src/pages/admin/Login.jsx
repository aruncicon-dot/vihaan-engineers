import { Lock, ArrowRight } from "lucide-react";
import SecretGate from "../../SecretGate";

export default function Login() {
  const lockedModules = [
    { title: "Accounts & Billing", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f", desc: "Financial tracking and invoicing." },
    { title: "Employees", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d", desc: "Staff directory and roles." },
    { title: "Attendance", img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7", desc: "Daily logs and time tracking." },
    { title: "Project Management", img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", desc: "Milestones and task delegation." },
    { title: "Vendors & Suppliers", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c", desc: "Procurement and contact logs." },
    { title: "Equipment Tracking", img: "https://images.unsplash.com/photo-1509395176047-4a66953fd231", desc: "Heavy machinery and tool logs." },
  ];

  return (
    <SecretGate>
      {/* pt-32: Absolute fix for the navbar disturbance. 
        bg-white: Clean, clinical professional backdrop.
      */}
      <div className="min-h-screen bg-white pt-32 pb-24 font-sans text-slate-900">
        
        {/* Hero Section: Editorial Style (No Shadows) */}
        <section className="px-6 md:px-16 max-w-7xl mx-auto border-b border-slate-100 pb-20">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-7 space-y-8">
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-blue-600"></span>
                <span className="text-[10px] font-bold tracking-[0.3em] text-blue-600 uppercase">
                  Vihaan Engineers v2.0
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95] text-slate-900">
                Precision <br /> 
                <span className="text-slate-400">Infrastructure.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                A unified industrial operating system designed to manage complex 
                construction workflows with absolute data integrity.
              </p>

              <div className="flex gap-4">
                <a
                  href="/admin/ve-supreme-sudo/inventory"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                >
                  Enter Inventory <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="aspect-4/5 grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
                  alt="Architecture"
                  className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section: Flat Editorial Grid */}
        <section className="px-6 md:px-16 max-w-7xl mx-auto py-24">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Control Modules</h2>
            <div className="text-xs font-mono text-slate-400">STATUS: SYSTEM_READY</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-12">

            {/* Active Card - Sharp Lines, No Shadows */}
            <a
              href="/admin/ve-supreme-sudo/inventory"
              className="group block space-y-6"
            >
              <div className="relative aspect-video overflow-hidden border border-slate-100 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1724709162875-fe100dd0e04b"
                  alt="Inventory"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-tighter">
                  Active
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight group-hover:text-blue-600 transition-colors">
                  Material Inventory
                </h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Enterprise-grade stock tracking and automated supply chain logistics.
                </p>
              </div>
            </a>

            {/* Locked Cards - Editorial Grayscale Style */}
            {lockedModules.map((item, i) => (
              <div
                key={i}
                className="group space-y-6 opacity-60 grayscale hover:opacity-80 transition-all cursor-not-allowed"
              >
                <div className="relative aspect-video overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
                  <div className="absolute top-4 right-4 bg-slate-900 text-white p-1.5 shadow-sm">
                    <Lock size={12} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="px-6 md:px-16 max-w-7xl mx-auto border-t border-slate-100 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-lg font-black tracking-tighter uppercase italic">Vihaan Engineers.</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Construction Management System • All Rights Reserved
            </p>
          </div>
        </footer>

      </div>
    </SecretGate>
  );
}