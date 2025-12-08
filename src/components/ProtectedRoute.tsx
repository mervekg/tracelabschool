import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async (user: User | null) => {
      if (!user) {
        if (mounted) {
          navigate("/auth", { replace: true });
        }
        return;
      }

      // If no specific role required, just check authentication
      if (!requiredRole) {
        if (mounted) {
          setIsAuthorized(true);
          setIsLoading(false);
        }
        return;
      }

      // Check if user has the required role using the has_role function
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: requiredRole,
      });

      if (mounted) {
        if (error || !data) {
          // User doesn't have the required role
          navigate("/", { replace: true });
        } else {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          // Defer the check to avoid deadlocks
          setTimeout(() => {
            checkAuth(session?.user ?? null);
          }, 0);
        }
      }
    );

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuth(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
