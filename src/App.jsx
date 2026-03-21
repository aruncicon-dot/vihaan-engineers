import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import Loading from './components/ui/Loading';


// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./Notfound'));

//admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const InventoryManagementPage = lazy(() => import('./pages/admin/Inventory'));
const InventoryDetails = lazy(() => import('./pages/admin/InventoryDetails'));
const ModifyInventory = lazy(() => import('./pages/admin/ModifyInventory'));
const ActionInventory = lazy(() => import('./pages/admin/ActionInventory'));
const AddInventory = lazy(() => import('./pages/admin/AddInventory'));

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/project/:slug" element={<ProjectDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />

              {/* Admin Routes */}
              <Route path="/admin/ve-supreme-sudo" element={<AdminLogin />} />
              <Route path="/admin/ve-supreme-sudo/inventory" element={<InventoryManagementPage />} />
              <Route path="/admin/ve-supreme-sudo/inventory/:id" element={<InventoryDetails />} />
              <Route path="/admin/ve-supreme-sudo/inventory/:id/modify" element={<ModifyInventory />} />
              <Route path="/admin/ve-supreme-sudo/inventory/:id/action" element={<ActionInventory />} />
              <Route path="/admin/ve-supreme-sudo/inventory/add" element={<AddInventory />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
