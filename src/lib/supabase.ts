import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'startupconnect',
    },
  },
});

// Enable real-time for specific tables
supabase
  .channel('public:posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {})
  .subscribe();

supabase
  .channel('public:follows')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => {})
  .subscribe();

supabase
  .channel('public:profiles')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {})
  .subscribe();

supabase
  .channel('public:post_likes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {})
  .subscribe();

supabase
  .channel('public:messages')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {})
  .subscribe();

// Test connection
(async () => {
  try {
    const { error } = await supabase.from('posts').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error: unknown) {
    console.error('Supabase connection test error:', error);
  }
})();
