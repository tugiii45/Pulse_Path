// Shares the current profile and authentication actions across the application.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProfile } from "../services/profileService";
import { getAccessToken, logoutUser } from "../services/AuthService";

const AuthContext = createContext({
  profile: null,
  loading: true,
  reloadProfile: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    // No access token means there is no authenticated profile to restore.
    // Finish loading immediately so public routes can render.
    if (!getAccessToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // The profile endpoint is the source of truth for the user's role,
      // hospital, and superadmin status used by route and dashboard guards.
      const response = await getProfile();
      const normalizedProfile = response?.data ?? response;
      setProfile(normalizedProfile);
    } catch (error) {
      // A rejected profile request means the stored session is unusable.
      // Clear it instead of leaving the UI in a misleading authenticated state.
      console.error("Unable to load current profile:", error);
      logoutUser();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Restore the session once when the provider mounts.
    loadProfile();
  }, []);

  const logout = () => {
    // Clear both browser credentials and in-memory profile state together.
    logoutUser();
    setProfile(null);
  };

  const value = useMemo(
    () => ({
      profile,
      loading,
      reloadProfile: loadProfile,
      logout,
    }),
    [profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
