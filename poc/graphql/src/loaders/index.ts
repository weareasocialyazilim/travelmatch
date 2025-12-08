/**
 * DataLoader Implementation
 * 
 * Solves the N+1 query problem by batching database queries
 * Example:
 *   Without DataLoader: 1 query for moments + N queries for creators (N+1)
 *   With DataLoader: 1 query for moments + 1 batched query for all creators (2)
 */

import DataLoader from 'dataloader';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createDataLoaders(supabase: SupabaseClient) {
  // User Loader
  const userLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    // Return users in the same order as requested IDs
    const userMap = new Map(data.map(user => [user.id, user]));
    return ids.map(id => userMap.get(id) || null);
  });
  
  // Profile Loader
  const profileLoader = new DataLoader(async (userIds: readonly string[]) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', userIds as string[]);
    
    if (error) throw error;
    
    const profileMap = new Map(data.map(profile => [profile.user_id, profile]));
    return userIds.map(id => profileMap.get(id) || null);
  });
  
  // Moment Loader
  const momentLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('moments')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    const momentMap = new Map(data.map(moment => [moment.id, moment]));
    return ids.map(id => momentMap.get(id) || null);
  });
  
  // Match Loader
  const matchLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    const matchMap = new Map(data.map(match => [match.id, match]));
    return ids.map(id => matchMap.get(id) || null);
  });
  
  // Message Loader
  const messageLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    const messageMap = new Map(data.map(message => [message.id, message]));
    return ids.map(id => messageMap.get(id) || null);
  });
  
  // Comment Loader
  const commentLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    const commentMap = new Map(data.map(comment => [comment.id, comment]));
    return ids.map(id => commentMap.get(id) || null);
  });
  
  // Notification Loader
  const notificationLoader = new DataLoader(async (ids: readonly string[]) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .in('id', ids as string[]);
    
    if (error) throw error;
    
    const notificationMap = new Map(data.map(notification => [notification.id, notification]));
    return ids.map(id => notificationMap.get(id) || null);
  });
  
  return {
    userLoader,
    profileLoader,
    momentLoader,
    matchLoader,
    messageLoader,
    commentLoader,
    notificationLoader,
  };
}
