import { Navigate } from "react-router";
import { useAuth } from "../../store/authStore";

function RoleRoute({ children, allowedRoles }) {
  const { currentUser } = useAuth();

  if (!allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RoleRoute;
