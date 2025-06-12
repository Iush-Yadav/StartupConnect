import { create } from 'zustand';
import { supabase } from './supabase';

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
  login: (userId: string) => Promise<void>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<void>;
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
  toggleFollow: (profileIdToFollow: string) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchFollowedProfiles: () => Promise<void>;
  followedProfiles: User[];
  totalUnreadMessages: number;
  fetchTotalUnreadMessages: () => Promise<void>;
  followedUserIds: string[];
  fetchUnreadMessagesCountForUser: (senderId: string) => Promise<number>;
}

export const useStore = create<Store>((set, get) => ({
  currentUser: null,
  users: [],
  posts: [],
  followedProfiles: [],
  totalUnreadMessages: 0,
  followedUserIds: [],

  initialize: async () => {
    console.log('Initializing store: fetching current user and posts...');
    await get().fetchCurrentUser();
    console.log('Initialize: currentUser after fetchCurrentUser:', get().currentUser?.id);
    console.log('Initialize: Posts fetched.');
    // Fetch initial unread messages and set up subscription
    get().fetchTotalUnreadMessages();
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
        .select('id, full_name, username, user_type, avatar_url, bio, location, industry, founded_year, team_size, investment_range, phone')
        .eq('id', session.user.id)
        .single();

      console.log('fetchCurrentUser: Profile data:', profile);
      console.log('fetchCurrentUser: Profile fetch error:', profileFetchError);

      if (profile) {
        console.log('fetchCurrentUser: Profile found for user:', profile.id);
        set({
          currentUser: {
            id: session.user.id,
            email: session.user.email || '',
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
            phoneNumber: profile.phone || undefined,
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
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name, username, user_type, avatar_url, bio, location, industry, founded_year, team_size, investment_range, phone')
      .eq('id', session.user.id)
      .single();

    if (!existingProfile) {
      throw new Error('profile_not_found');
    }

    await get().login(session.user.id);
    await get().fetchPosts();
  },

  login: async (userId: string) => {
    console.log('login: Attempting to log in user with ID:', userId);
    const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
    console.log('login: Supabase session data after getSession:', session);
    console.log('login: Supabase getSession error:', getSessionError);

    if (getSessionError) {
      console.error('login: Error getting session:', getSessionError);
      set({ currentUser: null });
      return;
    }

    if (!session?.user) {
      console.warn('login: No session user found, cannot complete login.');
      set({ currentUser: null });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, username, user_type, avatar_url, bio, location, industry, founded_year, team_size, investment_range, phone')
      .eq('id', userId)
      .single();

    console.log('login: Profile data:', profile);
    console.log('login: Profile fetch error:', profileError);

    if (profile && session?.user) {
      set({
        currentUser: {
          id: userId,
          email: session.user.email || '',
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
          phoneNumber: profile.phone || undefined,
        },
      });
      await get().fetchPosts();
      console.log('Login: Posts fetched after user set.');
      // Fetch unread messages after login
      get().fetchTotalUnreadMessages();
    } else {
      console.warn('login: Profile or session user not found for provided userId:', userId);
      set({ currentUser: null });
    }
  },

  register: async (userData) => {
    try {
      // Step 1: Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.fullName,
            username: userData.username,
          }
        }
      });

      console.log('Supabase signUp response - authData:', authData);
      console.log('Supabase signUp error - authError:', authError);

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Registration failed: No user data returned from Supabase Auth after signup.');
      }

      // No profile insertion here. User will be created in auth.users,
      // and the profile will be created upon successful email confirmation
      // via the auth callback route.

      console.log('User created in auth.users, awaiting email confirmation.');

    } catch (error) {
      console.error('Registration error (caught in store.ts):', error);
      throw error;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null, posts: [], totalUnreadMessages: 0 });
  },

  fetchPosts: async () => {
    console.log('fetchPosts: Starting...');
    const { currentUser } = get();
    console.log('fetchPosts: currentUser at start:', currentUser?.id);

    const { data, error } = await supabase
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
      console.error('Error fetching posts:', error);
      return;
    }

    // Fetch followed user IDs for the current user if authenticated
    let followedUserIds: string[] = [];
    if (currentUser) {
      followedUserIds = await get().getFollowedUserIds();
    }

    const postsWithLikeAndFollowStatus = data.map(post => {
      // Ensure all required fields are present
      if (!post.id || !post.user_id) {
        console.error('Post missing required fields:', post);
        return null;
      }

      return {
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
    }).filter(Boolean); // Remove any null posts

    set({ posts: postsWithLikeAndFollowStatus });
  },

  createPost: async (post) => {
    const { currentUser } = get();
    if (!currentUser) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('posts')
      .insert({
        title: post.title,
        content: post.content,
        user_id: currentUser.id,
        media_urls: post.mediaUrls || [],
        tags: post.tags,
        category: post.category,
        startup_details: post.startupDetails || null,
      });

    if (error) throw error;
    get().fetchPosts(); // Refresh posts after creation
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
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
    get().fetchPosts(); // Refresh posts after deletion
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

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      console.error('toggleLike: Post not found in store:', postId);
      return;
    }

    const currentPost = posts[postIndex];
    const isCurrentlyLiked = currentPost.user_has_liked;

    // Optimistically update the UI
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = {
      ...currentPost,
      likes: isCurrentlyLiked ? currentPost.likes - 1 : currentPost.likes + 1,
      user_has_liked: !isCurrentlyLiked,
    };
    set({ posts: updatedPosts });

    try {
      if (isCurrentlyLiked) {
        console.log('toggleLike: Removing existing like');
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);
        if (error) throw error;
      } else {
        console.log('toggleLike: Adding new like');
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: currentUser.id,
          });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like, reverting optimistic update:', error);
      // Revert the optimistic update if the API call fails
      set({ posts: posts }); // Revert to the original state
    }
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
        phoneNumber: data.phoneNumber ?? state.currentUser.phoneNumber,
      } : null,
    }));
  },

  followUser: async (userId: string) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const { error } = await supabase.from('follows').insert({
      follower_id: currentUser.id,
      following_id: userId,
    });
    if (error) console.error('Error following user:', error);
    get().fetchFollowedProfiles(); // Refresh followed profiles
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

  toggleFollow: async (profileIdToFollow: string) => {
    const { currentUser } = get();
    if (!currentUser) {
      console.error('toggleFollow: No current user found');
      return;
    }

    if (!profileIdToFollow || typeof profileIdToFollow !== 'string') {
      console.error('toggleFollow: Invalid profileIdToFollow provided:', profileIdToFollow);
      return;
    }

    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(profileIdToFollow)) {
      console.error('toggleFollow: Invalid UUID format for profileIdToFollow:', profileIdToFollow);
      return;
    }

    console.log('toggleFollow: Attempting to toggle follow for profile:', profileIdToFollow, 'by user:', currentUser.id);

    const isCurrentlyFollowing = get().followedUserIds.includes(profileIdToFollow);
    console.log('toggleFollow: isCurrentlyFollowing (before optimistic update):', isCurrentlyFollowing);
    console.log('toggleFollow: followedUserIds (before optimistic update):', get().followedUserIds);

    if (isCurrentlyFollowing) {
      console.log('toggleFollow: Unfollowing user');
      // Optimistically update the store
      set(state => ({
        followedUserIds: state.followedUserIds.filter(id => id !== profileIdToFollow),
        users: state.users.map(user => 
          user.id === profileIdToFollow ? { ...user, user_has_followed: false } : user
        ),
        followedProfiles: state.followedProfiles.filter(profile => profile.id !== profileIdToFollow)
      }));
      console.log('toggleFollow: followedUserIds (after optimistic unfollow update):', get().followedUserIds);

      const { error } = await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', profileIdToFollow);
      if (error) {
        console.error('Error unfollowing user:', error);
        // Revert optimistic update if API call fails
        set(state => ({
          followedUserIds: [...state.followedUserIds, profileIdToFollow],
          users: state.users.map(user => 
            user.id === profileIdToFollow ? { ...user, user_has_followed: true } : user
          ),
          followedProfiles: [...state.followedProfiles, { ...state.users.find(u => u.id === profileIdToFollow)!, user_has_followed: true }]
        }));
        console.log('toggleFollow: followedUserIds (after unfollow rollback):', get().followedUserIds);
      }
    } else {
      console.log('toggleFollow: Following user');
      // Optimistically update the store
      set(state => ({
        followedUserIds: [...state.followedUserIds, profileIdToFollow],
        users: state.users.map(user => 
          user.id === profileIdToFollow ? { ...user, user_has_followed: true } : user
        ),
        followedProfiles: [...state.followedProfiles, { ...state.users.find(u => u.id === profileIdToFollow)!, user_has_followed: true }]
      }));
      console.log('toggleFollow: followedUserIds (after optimistic follow update):', get().followedUserIds);

      const { error } = await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: profileIdToFollow });
      if (error) {
        console.error('Error following user:', error);
        // Revert optimistic update if API call fails
        set(state => ({
          followedUserIds: state.followedUserIds.filter(id => id !== profileIdToFollow),
          users: state.users.map(user => 
            user.id === profileIdToFollow ? { ...user, user_has_followed: false } : user
          ),
          followedProfiles: state.followedProfiles.filter(profile => profile.id !== profileIdToFollow)
        }));
        console.log('toggleFollow: followedUserIds (after follow rollback):', get().followedUserIds);
      }
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
}));

// Real-time subscription for unread messages
supabase
  .channel('unread_messages_count')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
  }, payload => {
    const { currentUser, fetchTotalUnreadMessages } = useStore.getState();
    // Check if the inserted message is for the current user and is unread
    if (payload.new.receiver_id === currentUser?.id && !payload.new.is_read) {
      fetchTotalUnreadMessages();
    }
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
  }, payload => {
    const { currentUser, fetchTotalUnreadMessages } = useStore.getState();
    // Check if the updated message is for the current user and its read status changed
    if (payload.new.receiver_id === currentUser?.id && payload.old.is_read === false && payload.new.is_read === true) {
      fetchTotalUnreadMessages();
    }
  })
  .subscribe();
