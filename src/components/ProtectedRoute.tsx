import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import { Role } from '../constants/roles';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role; // si no se pasa, cualquier usuario autenticado puede acceder
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!role) return <Navigate to={ROUTES.LOGIN} replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to={ROUTES.GETAWAYS} replace />;

  return <>{children}</>;
}
