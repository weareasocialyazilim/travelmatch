import { AuthBindings } from "@refinedev/core";
import { SupabaseClient } from "@supabase/supabase-js";

export const authProvider = (supabaseClient: SupabaseClient): AuthBindings => ({
  login: async ({ email, password }) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          name: "LoginError",
        },
      };
    }

    if (data.session) {
      // Check for Admin role
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();

      if (profile?.role !== "Admin") {
        await supabaseClient.auth.signOut();
        return {
          success: false,
          error: {
            message: "Unauthorized: You do not have admin access",
            name: "UnauthorizedError",
          },
        };
      }

      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "LoginError",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error: {
          message: error.message,
          name: "LogoutError",
        },
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const { data } = await supabaseClient.auth.getSession();
    const { session } = data;

    if (!session) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: true,
    };
  },
  getPermissions: async () => {
    const { data } = await supabaseClient.auth.getUser();
    
    if (data.user) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
        
      return profile?.role;
    }
    
    return null;
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
});
