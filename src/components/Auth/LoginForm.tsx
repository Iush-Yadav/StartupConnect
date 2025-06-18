import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useStore(state => state.login);
  const resendConfirmationEmail = useStore(state => state.resendConfirmationEmail);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Check for error message from navigation state
  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
      // Clear the state so the message doesn't persist on subsequent visits
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Check for lockout
  useEffect(() => {
    const checkLockout = () => {
      const storedLockout = localStorage.getItem('loginLockout');
      if (storedLockout) {
        const lockoutEnd = parseInt(storedLockout);
        if (Date.now() < lockoutEnd) {
          setLockoutTime(lockoutEnd);
        } else {
          localStorage.removeItem('loginLockout');
          setLockoutTime(null);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);
    setShowResendOption(false);

    // Check if user is locked out
    if (lockoutTime) {
      const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
      setError(`Too many login attempts. Please try again in ${remainingTime} seconds.`);
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Implement rate limiting
        if (newAttempts >= 5) {
          const lockoutEnd = Date.now() + 5 * 60 * 1000; // 5 minutes lockout
          localStorage.setItem('loginLockout', lockoutEnd.toString());
          setLockoutTime(lockoutEnd);
          setError('Too many login attempts. Please try again in 5 minutes.');
          return;
        }

        if (signInError.message.includes('Email not confirmed')) {
          setError('Your email address has not been confirmed. Please check your inbox for the confirmation email.');
          setShowResendOption(true);
          return;
        }
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Account not found or invalid credentials. Please check your email and password, or register a new account.');
          return;
        }
        throw signInError;
      }

      if (data.user) {
        // Reset login attempts on successful login
        setLoginAttempts(0);
        localStorage.removeItem('loginLockout');
        
        await login(data.user.id);
        setShowSuccess(true);
        navigate('/home');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage(null);
    setError(null);

    const result = await resendConfirmationEmail(formData.email);
    setResendMessage(result.message);
    if (result.success) {
      setShowResendOption(false);
    }
    setResendLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during Google login');
    }
  };

  // Success Message Component
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl shadow-lg border border-green-200"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-3 bg-green-100 rounded-full mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-800 mb-2"
          >
            Login Successful!
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-green-700 mb-4"
          >
            Welcome back! You have been logged in successfully.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-green-600"
          >
            Redirecting you to the home page...
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showResendOption && (
        <div className="bg-yellow-100 text-yellow-600 p-4 rounded-lg border border-yellow-200">
          <p className="mb-2">Haven't received the confirmation email?</p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="text-yellow-700 underline hover:text-yellow-800"
          >
            {resendLoading ? 'Sending...' : 'Resend confirmation email'}
          </button>
          {resendMessage && (
            <p className="mt-2 text-sm">{resendMessage}</p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1 relative">
            <input
              type="email"
              id="email"
              required
              className="block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading || !!lockoutTime}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading || !!lockoutTime}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !!lockoutTime}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : lockoutTime ? (
          `Try again in ${Math.ceil((lockoutTime - Date.now()) / 1000)}s`
        ) : (
          'Sign in'
        )}
      </button>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading || !!lockoutTime}
        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="h-5 w-5 mr-2"
        />
        Sign in with Google
      </button>
    </motion.form>
  );
}