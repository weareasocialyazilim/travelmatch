/**
 * API Service
 *
 * Central API functions for moment operations.
 * Uses the enhanced error handling and interceptors from api.ts.
 *
 * @module services/apiService
 *
 * @example
 * ```tsx
 * import { getMoments, createMoment, deleteMoment } from '../services/apiService';
 *
 * // Fetch all moments
 * const moments = await getMoments();
 *
 * // Create a new moment
 * const newMoment = await createMoment({
 *   title: 'Amazing Coffee',
 *   category: 'coffee',
 *   amount: 15,
 * });
 *
 * // Delete a moment
 * await deleteMoment('moment-123');
 * ```
 */
import { logger } from '../utils/logger';

import { api } from '../utils/api';
import type { Moment } from '../types';

/**
 * Fetch all moments
 *
 * @returns Array of moments
 * @throws API error if request fails
 */
export const getMoments = async (): Promise<Moment[]> => {
  try {
    const data = await api.get<Moment[]>('/moments');
    return data;
  } catch (error) {
    // Error handling api.ts'de yapılıyor
    logger.error('Failed to fetch moments:', error);
    throw error;
  }
};

/**
 * Fetch a single moment by ID
 *
 * @param id - Moment ID to fetch
 * @returns Moment data or null if not found
 * @throws API error if request fails
 */
export const getMomentById = async (id: string): Promise<Moment | null> => {
  try {
    const data = await api.get<Moment>(`/moments/${id}`);
    return data;
  } catch (error) {
    logger.error(`Failed to fetch moment ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new moment
 *
 * @param moment - Moment data to create
 * @returns Created moment with ID
 * @throws API error if request fails
 */
export const createMoment = async (
  moment: Partial<Moment>,
): Promise<Moment> => {
  try {
    const data = await api.post<Moment>('/moments', moment);
    return data;
  } catch (error) {
    logger.error('Failed to create moment:', error);
    throw error;
  }
};

/**
 * Update an existing moment
 *
 * @param id - Moment ID to update
 * @param moment - Updated moment data
 * @returns Updated moment
 * @throws API error if request fails
 */
export const updateMoment = async (
  id: string,
  moment: Partial<Moment>,
): Promise<Moment> => {
  try {
    const data = await api.put<Moment>(`/moments/${id}`, moment);
    return data;
  } catch (error) {
    logger.error(`Failed to update moment ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a moment
 *
 * @param id - Moment ID to delete
 * @throws API error if request fails
 */
export const deleteMoment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/moments/${id}`);
  } catch (error) {
    logger.error(`Failed to delete moment ${id}:`, error);
    throw error;
  }
};
