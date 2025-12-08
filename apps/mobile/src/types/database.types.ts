/**
 * Supabase Database Types
 * Auto-generated types için placeholder
 * TODO: `pnpm db:generate-types` ile generate edilecek
 */

export interface Database {
  public: {
    Tables: {
      moments: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          location: string;
          images: string[];
          price: number;
          currency: string;
          max_guests: number;
          duration: number;
          availability: any[];
          user_id: string;
          created_at: string;
          updated_at: string;
          status: string;
          users?: {
            name: string;
            avatar: string;
          };
          user?: {
            name: string;
            avatar: string;
          };
          categories?: any;
        };
      };
      reviews: {
        Row: {
          id: string;
          rating: number;
          comment: string | null;
          reviewer_id: string;
          reviewed_id: string;
          moment_id: string;
          created_at: string;
          reviewer?: {
            full_name: string;
            avatar_url: string;
          };
          moment?: {
            title: string;
          };
        };
      };
    };
  };
}

// Helper types
export type MomentRow = Database['public']['Tables']['moments']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
