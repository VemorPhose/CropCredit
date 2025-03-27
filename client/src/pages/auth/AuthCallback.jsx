import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          navigate("/login?confirmed=true");
        }
      } catch (error) {
        console.error("Error handling confirmation:", error);
        navigate("/login?error=confirmation-failed");
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Verifying your email...</h2>
        <p>Please wait while we confirm your registration.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
