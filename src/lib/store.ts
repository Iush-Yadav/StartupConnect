import { create } from 'zustand';
import { supabase } from './supabase';
import type { Database } from '@/lib/database.types';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type PostRow = Tables['posts']['Row'];
type PostLike = Tables['post_likes']['Row'];
type Follow = Tables['follows']['Row'];

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  userType: 'entrepreneur' | 'investor';
  avatarUrl?: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  location?: string;
  foundedYear?: number;
  industry?: string;
  investmentRange?: string;
  teamSize?: number;
  phoneNumber?: string;
  user_has_followed?: boolean;
  unreadMessagesCount?: number;
  // Additional properties for entrepreneurs
  startupStage?: string;
  fundingStage?: string;
  businessModel?: string;
  targetMarket?: string;
  // Additional properties for investors
  investmentFocus?: string;
  investmentExperience?: string;
  preferredIndustries?: string[];
  investmentCriteria?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  mediaUrls: string[];
  createdAt: string;
  tags: string[];
  category: string;
  startupDetails?: {
    problem: string;
    solution: string;
    marketSize: string;
    competition: string;
    businessModel?: string;
    fundingNeeds: string;
    timeline: string;
    team: string;
  };
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
    location?: string;
    industry?: string;
    founded_year?: number;
    team_size?: number;
    bio?: string;
  };
  likes: number;
  user_has_liked: boolean;
  user_has_followed?: boolean;
}

interface Store {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  postsCache: Map<string, Post>;
  lastFetchTime: number;
  CACHE_DURATION: number;
  login: (userId: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  createPost: (post: Omit<Post, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updatePost: (postId: string, data: Partial<Post>) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<User>) => Promise<void>;
  fetchPosts: () => Promise<void>;
  handleOAuthLogin: (session: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => Promise<boolean>;
  getFollowedUserIds: () => Promise<string[]>;
  fetchPriorityPosts: () => Promise<void>;
  toggleFollow: (profileId: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchFollowedProfiles: () => Promise<void>;
  followedProfiles: User[];
  totalUnreadMessages: number;
  fetchTotalUnreadMessages: () => Promise<void>;
  followedUserIds: string[];
  fetchUnreadMessagesCountForUser: (senderId: string) => Promise<number>;
  resendConfirmationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
}

export const useStore = create<Store>((set, get) => ({
  currentUser: null,
  users: [],
  posts: [],
  postsCache: new Map(),
  lastFetchTime: 0,
  CACHE_DURATION: 30000, // 30 seconds cache
  followedProfiles: [],
  totalUnreadMessages: 0,
  followedUserIds: [],

  initialize: async () => {
    console.log('Initializing store: fetching current user and posts...');
    await get().fetchCurrentUser();
    console.log('Initialize: currentUser after fetchCurrentUser:', get().currentUser?.id);
    console.log('Initialize: Posts fetched.');
    
    // Fetch initial data
    get().fetchTotalUnreadMessages();
    get().fetchFollowedProfiles();
    get().fetchPosts();

    // Set up real-time subscriptions
    const currentUser = get().currentUser;
    if (currentUser) {
      // Subscribe to follows changes
      supabase
        .channel('user_follows')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${currentUser.id}`
        }, async (payload) => {
          console.log('Follows change detected:', payload);
          await get().fetchFollowedProfiles();
          await get().fetchPosts();
        })
        .subscribe();

      // Subscribe to posts changes
      supabase
        .channel('user_posts')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts'
        }, async (payload) => {
          console.log('Posts change detected:', payload);
          await get().fetchPosts();
        })
        .subscribe();

      // Subscribe to likes changes
      supabase
        .channel('user_likes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'post_likes'
        }, async (payload) => {
          console.log('Likes change detected:', payload);
          await get().fetchPosts();
        })
        .subscribe();

      // Subscribe to profile changes
      supabase
        .channel('user_profiles')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, async (payload) => {
          console.log('Profile change detected:', payload);
          if (payload.new && 'id' in payload.new && payload.new.id === currentUser.id) {
            await get().fetchCurrentUser();
          }
          await get().fetchFollowedProfiles();
          await get().fetchPosts();
        })
        .subscribe();
    }
  },

  fetchCurrentUser: async () => {
    console.log('fetchCurrentUser: Attempting to get session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('fetchCurrentUser: Supabase session data:', session);
    if (error) {
      console.error('fetchCurrentUser: Error fetching session:', error);
      set({ currentUser: null });
      return;
    }

    if (session?.user) {
      console.log('fetchCurrentUser: Session user found:', session.user.id);
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      console.log('fetchCurrentUser: Profile data:', profile);
      console.log('fetchCurrentUser: Profile fetch error:', profileFetchError);

      if (profile && !profileFetchError) {
        const typedProfile = profile as Profile;
        console.log('fetchCurrentUser: Profile found for user:', typedProfile.id);
        set({
          currentUser: {
            id: session.user.id,
            email: session.user.email || '',
            fullName: typedProfile.full_name || '',
            username: typedProfile.username || '',
            userType: (typedProfile.user_type === 'entrepreneur' || typedProfile.user_type === 'investor' ? typedProfile.user_type : 'entrepreneur'),
            avatarUrl: typedProfile.avatar_url || undefined,
            bio: typedProfile.bio || undefined,
            location: typedProfile.location || undefined,
            industry: typedProfile.industry || undefined,
            foundedYear: typedProfile.founded_year || undefined,
            teamSize: typedProfile.team_size || undefined,
            investmentRange: typedProfile.investment_range || undefined,
            phoneNumber: typedProfile.phone || undefined,
          },
        });
      } else {
        console.warn('fetchCurrentUser: Profile not found for authenticated user', session.user.id);
        set({ currentUser: null });
      }
    } else {
      console.log('fetchCurrentUser: No session user found.');
      set({ currentUser: null });
    }
  },

  handleOAuthLogin: async (session) => {
    if (!session?.user) {
      throw new Error('No user data in session');
    }

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (!existingProfile) {
      // Create profile from session data
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata.full_name || '',
          username: session.user.user_metadata.username || '',
          user_type: session.user.user_metadata.user_type || 'entrepreneur',
          avatar_url: session.user.user_metadata.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        throw createError;
      }
    }

    await get().login(session.user.id);
  },

  login: async (userId: string) => {
    console.log('Login: Attempting to log in user with ID:', userId);
    const { data: { session }, error: getSessionError } = await supabase.auth.getSession();

    if (getSessionError) {
      console.error('Login: Error getting session:', getSessionError);
      set({ currentUser: null });
      return;
    }

    if (!session?.user) {
      console.warn('Login: No session user found, cannot complete login.');
      set({ currentUser: null });
      return;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Login: Error fetching profile:', profileError);
      set({ currentUser: null });
      return;
    }

    if (!profile) {
      console.error('Login: No profile found for user:', userId);
      set({ currentUser: null });
      return;
    }

    // Set current user with all profile data
    set({
      currentUser: {
        id: userId,
        email: session.user.email || '',
        fullName: profile.full_name || '',
        username: profile.username || '',
        userType: profile.user_type || 'entrepreneur',
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        industry: profile.industry,
        foundedYear: profile.founded_year,
        teamSize: profile.team_size,
        investmentRange: profile.investment_range,
        socialLinks: profile.social_links,
        user_has_followed: false,
        unreadMessagesCount: 0
      }
    });

    // Fetch initial data
    get().fetchTotalUnreadMessages();
    get().fetchFollowedProfiles();
    get().fetchPosts();
  },

  register: async (userData) => {
    try {
      console.log('Starting registration with data:', {
        email: userData.email,
        username: userData.username,
        userType: userData.userType
      });

      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.fullName,
            username: userData.username,
            user_type: userData.userType,
            email: userData.email.toLowerCase().trim(),
            // Store additional profile data in metadata
            bio: userData.bio,
            location: userData.location,
            industry: userData.industry,
            founded_year: userData.foundedYear,
            team_size: userData.teamSize,
            investment_range: userData.investmentRange,
            startup_stage: userData.startupStage,
            funding_stage: userData.fundingStage,
            business_model: userData.businessModel,
            target_market: userData.targetMarket,
            investment_focus: userData.investmentFocus,
            investment_experience: userData.investmentExperience,
            preferred_industries: userData.preferredIndustries,
            investment_criteria: userData.investmentCriteria,
            social_links: userData.socialLinks
          }
        }
      });

      if (authError) {
        console.error('Registration error:', authError);
        if (authError.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        if (authError.message.includes('Email rate limit exceeded')) {
          throw new Error('Too many email attempts. Please try again later.');
        }
        if (authError.message.includes('Email service error')) {
          throw new Error('Unable to send confirmation email. Please try again later or contact support.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Registration failed: No user data returned from Supabase Auth.');
      }

      // Always require email confirmation
      return { requiresEmailConfirmation: true };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, posts: [], totalUnreadMessages: 0 });
  },

  fetchPosts: async () => {
    const { currentUser, postsCache, lastFetchTime, CACHE_DURATION } = get();
    const now = Date.now();

    // Return cached posts if they're still fresh
    if (now - lastFetchTime < CACHE_DURATION && postsCache.size > 0) {
      set({ posts: Array.from(postsCache.values()) });
      return;
    }

    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            username,
            avatar_url,
            location,
            industry,
            founded_year,
            team_size,
            bio
          ),
          post_likes ( user_id )
        `)
        .order('created_at', { ascending: false })
        .limit(20); // Limit to 20 posts per fetch

      if (error) throw error;

      const followedUserIds = currentUser ? await get().getFollowedUserIds() : [];

      const postsWithLikeAndFollowStatus = postsData.map(post => {
        if (!post.id || !post.user_id) return null;

        const processedPost = {
          ...post,
          id: post.id,
          userId: post.user_id,
          createdAt: post.created_at,
          mediaUrls: Array.isArray(post.media_urls) ? post.media_urls : [],
          likes: post.post_likes?.length || 0,
          user_has_liked: currentUser ? post.post_likes?.some((like: any) => like.user_id === currentUser.id) : false,
          user_has_followed: currentUser ? followedUserIds.includes(post.user_id) : false,
          startupDetails: typeof post.startup_details === 'object' && post.startup_details !== null ? post.startup_details : {},
          profiles: {
            full_name: post.profiles?.full_name || 'Unknown',
            username: post.profiles?.username || 'unknown',
            avatar_url: post.profiles?.avatar_url,
            location: post.profiles?.location,
            industry: post.profiles?.industry,
            founded_year: post.profiles?.founded_year,
            team_size: post.profiles?.team_size,
            bio: post.profiles?.bio
          }
        };

        // Update cache
        postsCache.set(post.id, processedPost);
        return processedPost;
      }).filter(Boolean);

      set({ 
        posts: postsWithLikeAndFollowStatus,
        lastFetchTime: now
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  createPost: async (post) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('User not authenticated');

    const postData: Tables['posts']['Insert'] = {
      title: post.title,
      content: post.content,
      user_id: currentUser.id,
      media_urls: post.mediaUrls || [],
      tags: post.tags,
      category: post.category,
      startup_details: post.startupDetails || null,
    };

    const { error } = await supabase
      .from('posts')
      .insert(postData);

    if (error) throw error;
    get().fetchPosts();
  },

  updatePost: async (postId: string, data: Partial<Post>) => {
    const { error } = await supabase
      .from('posts')
      .update({
        title: data.title,
        content: data.content,
        media_urls: data.mediaUrls !== undefined ? data.mediaUrls : null,
        tags: data.tags,
        category: data.category,
        startup_details: data.startupDetails || null,
      })
      .eq('id', postId);

    if (error) throw error;
    get().fetchPosts(); // Refresh posts after update
  },

  deletePost: async (postId: string) => {
    const { posts } = get();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    // Remove the post from local state immediately
    set({ posts: posts.filter(post => post.id !== postId) });

    // Optionally, refetch posts from backend for consistency
    get().fetchPosts();
  },

  toggleLike: async (postId: string) => {
    const { currentUser, posts } = get();
    if (!currentUser) {
      console.error('toggleLike: No current user found');
      return;
    }

    if (!postId || typeof postId !== 'string') {
      console.error('toggleLike: Invalid postId provided:', postId);
      return;
    }

    // Find the post and its current like status
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      console.error('toggleLike: Post not found in store:', postId);
      return;
    }

    const currentPost = posts[postIndex];
    const isCurrentlyLiked = currentPost.user_has_liked;

    // Immediately update UI
    const updatedPosts = posts.map(post =>
      post.id === postId
        ? {
            ...post,
            likes: isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            user_has_liked: !isCurrentlyLiked,
          }
        : post
    );
    
    // Update state immediately without waiting for database
    set({ posts: updatedPosts });

    // Handle database update in the background
    (async () => {
      try {
        if (isCurrentlyLiked) {
          // Unlike the post
          const { error } = await supabase
            .from('post_likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);
          
          if (error) {
            console.error('Error unliking post:', error);
            // Only revert if there's an error
            set({ posts });
          }
        } else {
          // Check if like already exists before inserting
          const { data: existingLikes, error: checkError } = await supabase
            .from('post_likes')
            .select('post_id, user_id')
            .eq('post_id', postId)
            .eq('user_id', currentUser.id);

          if (checkError) {
            console.error('Error checking existing like:', checkError);
            set({ posts });
            return;
          }

          // Only insert if like doesn't exist
          if (!existingLikes || existingLikes.length === 0) {
            const { error } = await supabase
              .from('post_likes')
              .insert({
                post_id: postId,
                user_id: currentUser.id,
              });
            
            if (error) {
              console.error('Error liking post:', error);
              // Only revert if there's an error
              set({ posts });
            }
          }
        }
      } catch (error) {
        console.error('Error in toggleLike background update:', error);
        // Only revert if there's an error
        set({ posts });
      }
    })();
  },

  updateUserProfile: async (userId, data) => {
    // Map the form data to match database column names
    const profileData = {
      full_name: data.fullName,
      username: data.username,
      user_type: data.userType,
      avatar_url: data.avatarUrl,
      bio: data.bio,
      location: data.location,
      industry: data.industry,
      founded_year: data.foundedYear,
      team_size: data.teamSize,
      investment_range: data.investmentRange,
      // Ensure phoneNumber is explicitly excluded from the update payload
      // phoneNumber: data.phoneNumber, // THIS LINE IS NOW COMMENTED OUT PERMANENTLY
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      if (error.code === '23505' && error.message?.includes('profiles_username_key')) {
        throw new Error('This username is already taken. Please choose a different one.');
      }
      throw new Error('Failed to update profile. Please try again.');
    }

    // Update the local state with the new data
    set(state => ({
      currentUser: state.currentUser ? {
        ...state.currentUser,
        fullName: data.fullName ?? state.currentUser.fullName,
        username: data.username ?? state.currentUser.username,
        userType: data.userType ?? state.currentUser.userType,
        avatarUrl: data.avatarUrl ?? state.currentUser.avatarUrl,
        bio: data.bio ?? state.currentUser.bio,
        location: data.location ?? state.currentUser.location,
        industry: data.industry ?? state.currentUser.industry,
        foundedYear: data.foundedYear ?? state.currentUser.foundedYear,
        teamSize: data.teamSize ?? state.currentUser.teamSize,
        investmentRange: data.investmentRange ?? state.currentUser.investmentRange,
        // Removed phoneNumber from local state update as it's not sent to backend
        // phoneNumber: data.phoneNumber ?? state.currentUser.phoneNumber,
      } : null,
    }));
  },

  followUser: async (userId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const followData: Tables['follows']['Insert'] = {
      follower_id: currentUser.id,
      following_id: userId,
    };

    const { error } = await supabase
      .from('follows')
      .insert(followData);

    if (error) console.error('Error following user:', error);
    get().fetchFollowedProfiles();
  },

  unfollowUser: async (userId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const { error } = await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
    if (error) console.error('Error unfollowing user:', error);
    get().fetchFollowedProfiles(); // Refresh followed profiles
  },

  isFollowing: async (userId: string) => {
    const { currentUser } = get();
    if (!currentUser) return false;

    if (!userId || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(userId)) {
      console.error('Invalid userId provided to isFollowing:', userId);
      return false;
    }

    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is expected
      console.error('Error checking follow status:', error);
      return false;
    }
    return !!data;
  },

  getFollowedUserIds: async () => {
    const { currentUser } = get();
    if (!currentUser) return [];

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id);

    if (error) {
      console.error('Error fetching followed user IDs:', error);
      return [];
    }
    return data?.map(f => f.following_id) || [];
  },

  fetchFollowedProfiles: async () => {
    const { currentUser } = get();
    if (!currentUser) {
      set({ followedProfiles: [] });
      return;
    }

    try {
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id);

      if (followsError) {
        console.error('Error fetching follows:', followsError);
        return;
      }

      const followedUserIds = followsData?.map(f => f.following_id) || [];
      
      if (followedUserIds.length === 0) {
        set({ followedProfiles: [] });
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_type, bio, location, industry, founded_year, team_size, investment_range')
        .in('id', followedUserIds);

      if (profilesError) {
        console.error('Error fetching followed profiles:', profilesError);
        return;
      }

      const fetchedFollowedUsers = (profilesData || []).map(profile => ({
        id: profile.id,
        email: '',
        fullName: profile.full_name || '',
        username: profile.username || '',
        userType: (profile.user_type === 'entrepreneur' || profile.user_type === 'investor' ? profile.user_type : 'entrepreneur'),
        avatarUrl: profile.avatar_url || undefined,
        bio: profile.bio || undefined,
        location: profile.location || undefined,
        industry: profile.industry || undefined,
        foundedYear: profile.founded_year || undefined,
        teamSize: profile.team_size || undefined,
        investmentRange: profile.investment_range || undefined,
        user_has_followed: true,
      }));
      
      set({ followedProfiles: fetchedFollowedUsers, followedUserIds: followedUserIds });
    } catch (error) {
      console.error('Error in fetchFollowedProfiles:', error);
    }
  },

  fetchUsers: async () => {
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, user_type, avatar_url, bio, location, industry, founded_year, team_size, investment_range');

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const followedUserIds = get().followedUserIds;

    const fetchedUsers = (profilesData || []).map(profile => ({
      id: profile.id,
      email: '',
      fullName: profile.full_name || '',
      username: profile.username || '',
      userType: (profile.user_type === 'entrepreneur' || profile.user_type === 'investor' ? profile.user_type : 'entrepreneur'),
      avatarUrl: profile.avatar_url || undefined,
      bio: profile.bio || undefined,
      location: profile.location || undefined,
      industry: profile.industry || undefined,
      foundedYear: profile.founded_year || undefined,
      teamSize: profile.team_size || undefined,
      investmentRange: profile.investment_range || undefined,
      user_has_followed: followedUserIds.includes(profile.id),
    }));

    set({ users: fetchedUsers });
  },

  fetchPriorityPosts: async () => {
    const { currentUser } = get();
    if (!currentUser) {
      // If no current user, fetch all posts without follow status
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            username,
            avatar_url,
            location,
            industry,
            founded_year,
            team_size,
            bio
          ),
          post_likes ( user_id )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all posts:', error);
        return;
      }

      const postsWithLikeStatus = (postsData || []).map(post => ({
        ...post,
        likes: post.post_likes.length || 0,
        user_has_liked: false, // No current user, so no likes
        user_has_followed: false, // No current user, so no follows
        profiles: {
          full_name: post.profiles?.full_name || 'Unknown',
          username: post.profiles?.username || 'unknown',
          avatar_url: post.profiles?.avatar_url,
          location: post.profiles?.location,
          industry: post.profiles?.industry,
          founded_year: post.profiles?.founded_year,
          team_size: post.profiles?.team_size,
          bio: post.profiles?.bio
        },
        startupDetails: post.startup_details ? (() => {
          try {
            const parsed = JSON.parse(post.startup_details);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
          } catch (e) {
            console.error("Error parsing startup_details in fetchPriorityPosts (no current user branch):", e, "Value:", post.startup_details);
            return {};
          }
        })() : {},
      }));
      set({ posts: postsWithLikeStatus });
      return;
    }

    // If currentUser exists, fetch posts with follow status
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          full_name,
          username,
          avatar_url,
          location,
          industry,
          founded_year,
          team_size,
          bio
        ),
        post_likes ( user_id )
      `)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching priority posts:', postsError);
      return;
    }

    const followedUserIds = await get().getFollowedUserIds();

    const postsWithStatus = (postsData || []).map(post => ({
      ...post,
      likes: post.post_likes.length || 0,
      user_has_liked: post.post_likes.some((like: any) => like.user_id === currentUser.id),
      user_has_followed: followedUserIds.includes(post.userId),
      startupDetails: post.startup_details ? (() => {
        try {
          const parsed = JSON.parse(post.startup_details);
          return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (e) {
          console.error("Error parsing startup_details in fetchPriorityPosts (current user branch):", e, "Value:", post.startup_details);
          return {};
        }
      })() : {},
      profiles: {
        full_name: post.profiles?.full_name || 'Unknown',
        username: post.profiles?.username || 'unknown',
        avatar_url: post.profiles?.avatar_url,
        location: post.profiles?.location,
        industry: post.profiles?.industry,
        founded_year: post.profiles?.founded_year,
        team_size: post.profiles?.team_size,
        bio: post.profiles?.bio
      }
    }));

    set({ posts: postsWithStatus });
  },

  toggleFollow: async (profileId: string) => {
    const { currentUser, followedUserIds } = get();
    if (!currentUser) {
      console.error('toggleFollow: No current user found');
      return;
    }

    if (!profileId || typeof profileId !== 'string') {
      console.error('toggleFollow: Invalid profileId provided:', profileId);
      return;
    }

    // Always get the latest followedUserIds for optimistic update
    const latestFollowedUserIds = get().followedUserIds;
    const isCurrentlyFollowing = latestFollowedUserIds.includes(profileId);

    // Optimistically update the UI
    const updatedFollowedUserIds = isCurrentlyFollowing
      ? latestFollowedUserIds.filter(id => id !== profileId)
      : [...latestFollowedUserIds, profileId];
    set({ followedUserIds: updatedFollowedUserIds });

    // Immediately update posts and users with new follow status
    const posts = get().posts.map(post => ({
      ...post,
      user_has_followed: updatedFollowedUserIds.includes(post.userId),
    }));
    set({ posts });

    const users = get().users.map(user => ({
      ...user,
      user_has_followed: updatedFollowedUserIds.includes(user.id),
    }));
    set({ users });

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profileId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: currentUser.id,
            following_id: profileId,
          });
        if (error) throw error;
      }
      // Real-time subscription will handle the UI updates
    } catch (error) {
      console.error('Error toggling follow, reverting optimistic update:', error);
      get().fetchFollowedProfiles();
      get().fetchPosts();
    }
  },

  fetchTotalUnreadMessages: async () => {
    const { currentUser } = get();
    if (!currentUser) {
      console.log('fetchTotalUnreadMessages: No current user, setting count to 0.');
      set({ totalUnreadMessages: 0 });
      return;
    }

    try {
      console.log('fetchTotalUnreadMessages: Fetching unread count for user:', currentUser.id);
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('receiver_id', currentUser.id)
        .eq('is_read', false);

      if (error) {
        console.error('fetchTotalUnreadMessages: Error fetching total unread messages:', error);
        set({ totalUnreadMessages: 0 });
        return;
      }
      console.log('fetchTotalUnreadMessages: Supabase returned count:', count);
      set({ totalUnreadMessages: count || 0 });
      console.log('fetchTotalUnreadMessages: Set totalUnreadMessages to:', count || 0);
    } catch (error) {
      console.error('fetchTotalUnreadMessages: Error in fetchTotalUnreadMessages (catch):', error);
      set({ totalUnreadMessages: 0 });
    }
  },

  fetchUnreadMessagesCountForUser: async (senderId: string): Promise<number> => {
    const { currentUser } = get();
    if (!currentUser) return 0;

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);

      if (error) {
        console.error(`Error fetching unread messages for user ${senderId}:`, error);
        return 0;
      }
      return count || 0;
    } catch (error) {
      console.error(`Error in fetchUnreadMessagesCountForUser for user ${senderId}:`, error);
      return 0;
    }
  },

  // New function to resend confirmation email
  resendConfirmationEmail: async (email: string) => {
    try {
      console.log('Attempting to resend confirmation email for:', email);
      
      // Attempt to resend the confirmation email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        console.error('Error resending confirmation email:', error);
        if (error.message.includes('Email rate limit exceeded')) {
          throw new Error('Too many email attempts. Please try again later.');
        }
        if (error.message.includes('Email service error')) {
          throw new Error('Unable to send confirmation email. Please try again later or contact support.');
        }
        if (error.message.includes('User not found')) {
          throw new Error('User not found. Please register first.');
        }
        if (error.message.includes('Email already confirmed')) {
          throw new Error('Email is already confirmed. Please try logging in.');
        }
        throw error;
      }

      console.log('Confirmation email successfully resent.');
      return { success: true, message: 'Confirmation email sent! Please check your inbox.' };
    } catch (error) {
      console.error('Failed to resend confirmation email:', error);
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Failed to resend email. Please try again later.' };
    }
  },
}));

// Initialize real-time subscriptions
const initializeSubscriptions = () => {
  // Unsubscribe from any existing channels
  supabase.removeAllChannels();

  // Subscribe to post likes changes
  supabase
    .channel('post_likes_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'post_likes',
    }, async (payload) => {
      const { currentUser, posts } = useStore.getState();
      if (!currentUser) return;

      console.log('Post likes change detected:', payload);

      // Skip processing if this is our own action
      if (payload.eventType === 'INSERT' && payload.new.user_id === currentUser.id) {
        return;
      }
      if (payload.eventType === 'DELETE' && payload.old.user_id === currentUser.id) {
        return;
      }

      // Handle different events
      if (payload.eventType === 'INSERT') {
        // New like added by another user
        const { post_id, user_id } = payload.new;
        const updatedPosts = posts.map(post => {
          if (post.id === post_id) {
            return {
              ...post,
              likes: post.likes + 1,
              user_has_liked: user_id === currentUser.id ? true : post.user_has_liked
            };
          }
          return post;
        });
        useStore.setState({ posts: updatedPosts });
      } else if (payload.eventType === 'DELETE') {
        // Like removed by another user
        const { post_id, user_id } = payload.old;
        const updatedPosts = posts.map(post => {
          if (post.id === post_id) {
            return {
              ...post,
              likes: Math.max(0, post.likes - 1),
              user_has_liked: user_id === currentUser.id ? false : post.user_has_liked
            };
          }
          return post;
        });
        useStore.setState({ posts: updatedPosts });
      }
    })
    .subscribe();

  // Subscribe to unread messages
  supabase
    .channel('unread_messages_count')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'messages',
    }, payload => {
      const { currentUser, fetchTotalUnreadMessages } = useStore.getState();
      if (!currentUser) return;

      // Handle different events
      if (payload.eventType === 'INSERT') {
        // New message received
        if (payload.new.receiver_id === currentUser.id && !payload.new.is_read) {
          fetchTotalUnreadMessages();
        }
      } else if (payload.eventType === 'UPDATE') {
        // Message status changed
        if (payload.new.receiver_id === currentUser.id) {
          fetchTotalUnreadMessages();
        }
      } else if (payload.eventType === 'DELETE') {
        // Message deleted
        if (payload.old.receiver_id === currentUser.id) {
          fetchTotalUnreadMessages();
        }
      }
    })
    .subscribe();
};

// Call initializeSubscriptions when the store is created
initializeSubscriptions();

// Add this function to create a profile
async function createProfile(userId: string, userData: { email: string; username: string; userType: string }) {
  try {
    console.log('Creating profile for user:', userId);
    
    const profileData = {
      id: userId,
      email: userData.email,
      username: userData.username,
      user_type: userData.userType,
      full_name: '',
      bio: '',
      avatar_url: '',
      website: '',
      location: '',
      company_name: '',
      company_size: '',
      investment_range: '',
      phone: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Profile data to insert:', profileData);

    // First check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      throw checkError;
    }

    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      return existingProfile;
    }

    // Create new profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('Profile created successfully:', profile);
    return profile;
  } catch (error) {
    console.error('Error in createProfile:', error);
    throw error;
  }
}

// Update the register function
async function register(email: string, password: string, username: string, userType: string) {
  try {
    console.log('Starting registration with data:', { email, username, userType });
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          username,
          user_type: userType,
          email: normalizedEmail
        }
      }
    });

    console.log('Auth response:', { data: authData, error: authError });

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    if (!authData.user) {
      console.error('No user data returned from signup');
      throw new Error('No user data returned from signup');
    }

    // The profile will now be created by a Supabase Database Trigger after email confirmation.
    // No client-side profile creation needed here.
    console.log('User signed up successfully. Profile creation will be handled by a database trigger.');

    return authData;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}