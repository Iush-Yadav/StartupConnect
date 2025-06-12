import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useStore();

  useEffect(() => {
    (async () => {
      try {
        console.log('AuthCallbackPage: Starting auth callback process...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('AuthCallbackPage: Error getting session:', sessionError);
          navigate('/login', { state: { error: 'Failed to authenticate.' } });
          return;
        }

        if (session) {
          console.log('AuthCallbackPage: Session found, user ID:', session.user.id);
          // Check if profile exists
          console.log('AuthCallbackPage: Checking for existing profile.');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          console.log('AuthCallbackPage: Profile data:', profile);
          console.log('AuthCallbackPage: Profile fetch error:', profileError);

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
            console.error('AuthCallbackPage: Error fetching profile:', profileError);
            navigate('/login', { state: { error: 'Failed to retrieve user profile.' } });
            return;
          }

          let userProfile = profile;

          if (!userProfile) {
            console.log('AuthCallbackPage: Profile not found, creating new profile for user:', session.user.id);
            // Create profile for newly confirmed user
            const { data: newProfile, error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || '',
                username: session.user.user_metadata?.username || '',
                user_type: session.user.user_metadata?.user_type || 'entrepreneur',
              })
              .select()
              .single();
            
            console.log('AuthCallbackPage: New profile creation data:', newProfile);
            console.log('AuthCallbackPage: New profile creation error:', createProfileError);
            
            if (createProfileError) {
              console.error('AuthCallbackPage: Error creating profile:', createProfileError);
              navigate('/login', { state: { error: 'Failed to create user profile.' } });
              return;
            }
            userProfile = newProfile;
            console.log('AuthCallbackPage: New profile created successfully:', userProfile);
          } else {
            console.log('AuthCallbackPage: Existing profile found:', userProfile);
          }

          // Log the user in to set currentUser in store and fetch posts
          console.log('AuthCallbackPage: Attempting to log user into store.');
          await login(session.user.id);
          console.log('AuthCallbackPage: User logged into store.');

          // Check if additional profile details are needed
          if (!userProfile.username || !userProfile.user_type) {
            console.log('AuthCallbackPage: Profile incomplete, redirecting to /complete-profile');
            navigate('/complete-profile');
          } else {
            console.log('AuthCallbackPage: Profile complete, redirecting to /home');
            navigate('/home');
          }

        } else {
          console.log('AuthCallbackPage: No session found after callback, redirecting to /login');
          navigate('/login');
        }
      } catch (error) {
        console.error('AuthCallbackPage: Unhandled error:', error);
        navigate('/login', { state: { error: 'An unexpected error occurred during authentication.' } });
      }
    })();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
