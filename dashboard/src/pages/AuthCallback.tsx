import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthToken } from "../services/api";
import { useAuth } from "../stores/authContext";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      setAuthToken(token);
      refetchUser().then(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/login", { replace: true });
    }
    
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="text-lg">Authenticating...</div>
      </div>
    </div>
  );
}
