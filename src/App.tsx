import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import ProductManagement from './pages/ProductManagement';
import ProtectedRoute from './components/ProtectedRoute'; 
import Dashboard from './pages/Dashboard';
import CategoryManagement from './pages/CategoryManagement';
import SubvendorManagement from './pages/SubvendorManagement';
import BrandManagement from './pages/BrandManagement';
import OwnerManagement from './pages/OwnerManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Herkese Açık Rota */}
        <Route path="/login" element={<Login />} />

        {/* Korumalı Rotalar */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800">Genel Bakış</h1>
                  <p className="text-gray-500 mt-2">Sisteme başarıyla giriş yapıldı.</p>
                </div>
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/product-management"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/category-management"
          element={
            <ProtectedRoute>
              <Layout>
                <CategoryManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/subvendor-management"
          element={
            <ProtectedRoute>
              <Layout>
                <SubvendorManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/brand-management"
          element={
            <ProtectedRoute>
              <Layout>
                <BrandManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/owner-management"
          element={
            <ProtectedRoute>
              <Layout>
                <OwnerManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        {/* Tanımlanmayan yollar için yönlendirme */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;