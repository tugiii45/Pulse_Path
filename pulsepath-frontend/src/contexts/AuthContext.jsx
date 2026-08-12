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
    if (!getAccessToken()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await getProfile();
      const normalizedProfile = response?.data ?? response;
      setProfile(normalizedProfile);
    } catch (error) {
      console.error("Unable to load current profile:", error);
      logoutUser();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
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
