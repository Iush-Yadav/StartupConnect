import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { Loader, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const login = useStore(state => state.login);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthCallback: Auth state change event:', event);
      console.log('AuthCallback: Session data:', session);

      if (event === 'SIGNED_IN' && session) {
        console.log('AuthCallback: User signed in, attempting to log in...');
        try {
          await login(session.user.id);
          console.log('AuthCallback: User logged in successfully. Redirecting to /home.');
          navigate('/home', { replace: true });
        } catch (error) {
          console.error('AuthCallback: Error during login after sign in:', error);
          navigate('/login', { replace: true, state: { error: 'Failed to log in after confirmation.' } });
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthCallback: User signed out. Redirecting to /login.');
        navigate('/login', { replace: true });
      } else if (event === 'USER_UPDATED' && session?.user.email_confirmed_at) {
        // This case handles when the email gets confirmed, but user might not be signed in yet
        console.log('AuthCallback: User updated (email confirmed). Attempting to log in.');
        try {
          await login(session.user.id);
          console.log('AuthCallback: User logged in successfully after email confirmation. Redirecting to /home.');
          navigate('/home', { replace: true });
        } catch (error) {
          console.error('AuthCallback: Error logging in after email confirmation:', error);
          navigate('/login', { replace: true, state: { error: 'Failed to log in after confirmation.' } });
        }
      } else if (event === 'INITIAL_SESSION' && !session) {
        console.log('AuthCallback: No initial session. Redirecting to /login.');
        navigate('/login', { replace: true });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, login]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4"
    >
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center border border-purple-200 max-w-md w-full">
        <Loader className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing your request...</h2>
        <p className="text-gray-600">Please wait while we log you in. This may take a moment.</p>
      </div>
    </motion.div>
  );
} 