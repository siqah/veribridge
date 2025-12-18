import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Please check your email to verify your account',
        user: data.user,
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Check your email for the password reset link',
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error} = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Update password error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  };

  const value = {
    user,
    session,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
