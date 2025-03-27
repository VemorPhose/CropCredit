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

        if (user && user.user_metadata.initial_setup_needed) {
          // Now the user is authenticated, create the user record
          const { error: createError } = await supabase.from("users").insert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata.name,
              role: user.user_metadata.role,
            },
          ]);

          if (createError) throw createError;

          // Create role-specific profile
          if (user.user_metadata.role === "farmer") {
            await supabase
              .from("farmer_profiles")
              .insert([{ user_id: user.id }]);
          } else if (user.user_metadata.role === "lender") {
            await supabase
              .from("lender_profiles")
              .insert([{ user_id: user.id }]);
          }

          // Update user metadata to indicate setup is complete
          await supabase.auth.updateUser({
            data: { initial_setup_needed: false },
          });
        }

        navigate("/login?confirmed=true");
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
