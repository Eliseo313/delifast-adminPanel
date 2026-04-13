import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  const storedUser = localStorage.getItem('userAP');

  if (!user && !storedUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}
