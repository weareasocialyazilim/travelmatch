import { Moment } from '../types';

// Mock API functions (replace with your actual API calls)

export const getMoments = async (): Promise<Moment[]> => {
  try {
    // In a real app, you would fetch this from your API
    // const response = await api.get('/moments');
    // return response.data;

    // For now, returning mock data after a short delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]); // No moments initially
      }, 1000);
    });
  } catch (error) {
    console.error('Failed to fetch moments:', error);
    throw new Error('Could not retrieve moments. Please try again later.');
  }
};

export const getMomentById = async (id: string): Promise<Moment | null> => {
  try {
    // const response = await api.get(`/moments/${id}`);
    // return response.data;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(null); // No moment initially
      }, 500);
    });
  } catch (error) {
    console.error(`Failed to fetch moment ${id}:`, error);
    throw new Error('Could not retrieve the moment. Please try again later.');
  }
};
