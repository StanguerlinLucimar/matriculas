import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth";

// Protege as rotas: exige login e o perfil correto (aluno x instituição).
export default function RequireAuth({ perfil }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (perfil && usuario.perfil !== perfil) {
    return <Navigate to={usuario.perfil === "aluno" ? "/aluno" : "/institucional"} replace />;
  }

  return <Outlet />;
}
