
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("hospitalUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("hospitalToken") || ""
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem("hospitalUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("hospitalUser");
    }

    if (token) {
      localStorage.setItem("hospitalToken", token);
    } else {
      localStorage.removeItem("hospitalToken");
    }
  }, [user, token]);

  const login = (userData, authToken = "") => {
  // Generate a demo token if the login flow didn't supply one
  const tokenToStore =
    authToken || `demo-${crypto.randomUUID()}`;

  console.log("[TOKEN MANAGEMENT] Login successful:", {
    userProvided: Boolean(userData),
    tokenGenerated: Boolean(tokenToStore),
  });

  setUser(userData);
  setToken(tokenToStore);
};

  const logout = () => {
    setUser(null);
    setToken("");
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

export default AuthContext;
