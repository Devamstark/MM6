import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    allowedRoles?: string[];
    redirectPath?: string;
    children?: React.ReactNode;
}

export const ProtectedRoute = ({
    allowedRoles,
    redirectPath = '/login',
    children,
}: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard or home if unauthorized for this route
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'seller') return <Navigate to="/seller" replace />;
        return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};
