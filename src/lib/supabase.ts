import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
});

// Initialize storage bucket and policies
(async () => {
  try {
    // Check if media bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error checking storage buckets:', bucketsError);
      return;
    }

    const mediaBucketExists = buckets?.some(bucket => bucket.name === 'media');

    if (!mediaBucketExists) {
      // Create media bucket
      const { error: createError } = await supabase
        .storage
        .createBucket('media', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/*', 'video/*']
        });

      if (createError) {
        console.error('Error creating media bucket:', createError);
        return;
      }

      console.log('Created media bucket successfully');
    }

    // Remove this block - storage policies should be set manually in Supabase dashboard
    // const { error: policyError } = await supabase.rpc('setup_storage_policies');
    
    // if (policyError) {
    //   console.error('Error setting up storage policies:', policyError);
    // } else {
    //   console.log('Storage policies set up successfully');
    // }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
})();

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