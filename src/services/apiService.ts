/**
 * API Service
 * Merkezi API fonksiyonları
 *
 * Artık api.ts'deki gelişmiş error handling ve interceptor'lar kullanılıyor
 */

import { api } from '../utils/api';
import type { Moment } from '../types';

/**
 * Moments API
 */
export const getMoments = async (): Promise<Moment[]> => {
  try {
    const data = await api.get<Moment[]>('/moments');
    return data;
  } catch (error) {
    // Error handling api.ts'de yapılıyor
    console.error('Failed to fetch moments:', error);
    throw error;
  }
};

export const getMomentById = async (id: string): Promise<Moment | null> => {
  try {
    const data = await api.get<Moment>(`/moments/${id}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch moment ${id}:`, error);
    throw error;
  }
};

export const createMoment = async (
  moment: Partial<Moment>,
): Promise<Moment> => {
  try {
    const data = await api.post<Moment>('/moments', moment);
    return data;
  } catch (error) {
    console.error('Failed to create moment:', error);
    throw error;
  }
};

export const updateMoment = async (
  id: string,
  moment: Partial<Moment>,
): Promise<Moment> => {
  try {
    const data = await api.put<Moment>(`/moments/${id}`, moment);
    return data;
  } catch (error) {
    console.error(`Failed to update moment ${id}:`, error);
    throw error;
  }
};

export const deleteMoment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/moments/${id}`);
  } catch (error) {
    console.error(`Failed to delete moment ${id}:`, error);
    throw error;
  }
};
