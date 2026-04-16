import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ScreeningLabPage from './pages/ScreeningLabPage';
import Footer from './Footer';
import Lenis from 'lenis';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { getAuth } from './auth';
import LoginPage from './pages/LoginPage';

const AdminRoute = ({ children }) => {
  const auth = getAuth();
  if (!auth || auth.role !== 'government_admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.5,
      smoothWheel: true,
      wheelMultiplier: 0.8,
    });
    return () => lenis.destroy();
  }, []);
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/technology" element={<GenericPage title="Technology" subtitle="Clinical-grade AI pipelines, explainability layers, and modular healthcare workflows." />} />
        <Route path="/about-us" element={<GenericPage title="About Us" subtitle="A healthcare-first design and engineering practice focused on trust, evidence, and impact." />} />
        <Route path="/main-menu" element={<GenericPage title="Main Menu" subtitle="Navigate all product streams and strategic initiatives from a centralized control page." />} />
        <Route path="/resources" element={<GenericPage title="Resources" subtitle="Guides, design references, implementation notes, and healthcare AI playbooks." />} />
        <Route path="/contact-us" element={<GenericPage title="Contact Us" subtitle="Book a strategy call or request a product walkthrough with the Asklepios team." />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/screening-lab" element={<ScreeningLabPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
