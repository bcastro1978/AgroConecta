import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/Login';
import { RegisterPage } from './components/auth/RegisterForm';
import { ProducerDashboard } from './components/dashboard/ProducerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { BuyerDashboard } from './components/dashboard/BuyerDashboard';
import { SupplierDashboard } from './components/dashboard/SupplierDashboard';
import { LandingPage } from './components/landing/LandingPage';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        return <div className="p-8 text-center text-red-600">No tienes permisos para ver esta página</div>;
    }

    return <>{children}</>;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-[#FAF9F7] text-[#0A0A0A] font-sans">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardRouting />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

const DashboardRouting = () => {
    const { profile, user } = useAuth();
    const [isRepairing, setIsRepairing] = useState(false);

    const handleRepairProfile = async () => {
        if (!user) return;
        setIsRepairing(true);
        try {
            // Intenta crear el perfil manualmente si el trigger falló
            const { error } = await supabase.from('users').insert({
                id: user.id,
                full_name: user.user_metadata.full_name || 'Usuario Recuperado',
                role: (user.user_metadata.role || 'Productor'),
                verification_status: 'Pending'
            });

            if (error) throw error;
            window.location.reload(); // Recargar para obtener el perfil nuevo
        } catch (err: any) {
            alert('Error al reparar perfil: ' + err.message);
        } finally {
            setIsRepairing(false);
        }
    };

    // Si no hay perfil pero sí usuario, es un error de integridad
    if (!profile) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-xl font-bold mb-2">Error de Perfil</h2>
                <p>No se encontró tu información de usuario.</p>
                <div className="flex gap-4 justify-center mt-4">
                    <button
                        onClick={handleRepairProfile}
                        disabled={isRepairing}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                        {isRepairing ? 'Reparando...' : 'Reparar Perfil'}
                    </button>
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    }

    if (profile.role === 'Admin') return <AdminDashboard />;
    if (profile.role === 'Comprador') return <BuyerDashboard />;
    if (profile.role === 'Proveedor') return <SupplierDashboard />;
    return <ProducerDashboard />;
};

export default App;
