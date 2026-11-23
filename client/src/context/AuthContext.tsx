import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure cross-origin cookies are sent with requests
axios.defaults.withCredentials = true;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch {
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`,
      { email, password }
    );
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`,
      { name, email, password }
    );
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/logout`);
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
