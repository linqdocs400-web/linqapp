/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = string | number | boolean | null | undefined | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      ride_posts: {
        Row: {
          id: string;
          owner_id: string | null;
          ride_type: string | null;
          drop_location: string | null;
          vehicle_type: string | null;
          seats: number | null;
          days: string[] | null;
          return_journey: boolean | null;
          return_time: string | null;
          journey_date: string | null;
          journey_time: string | null;
          created_at: string | null;
          pickup_lat: number | null;
          pickup_lon: number | null;
          drop_lat: number | null;
          drop_lon: number | null;
          pickup_location: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          ride_type?: string | null;
          drop_location?: string | null;
          vehicle_type?: string | null;
          seats?: number | null;
          days?: string[] | null;
          return_journey?: boolean | null;
          return_time?: string | null;
          journey_date?: string | null;
          journey_time?: string | null;
          created_at?: string | null;
          pickup_lat?: number | null;
          pickup_lon?: number | null;
          drop_lat?: number | null;
          drop_lon?: number | null;
          pickup_location?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          ride_type?: string | null;
          drop_location?: string | null;
          vehicle_type?: string | null;
          seats?: number | null;
          days?: string[] | null;
          return_journey?: boolean | null;
          return_time?: string | null;
          journey_date?: string | null;
          journey_time?: string | null;
          created_at?: string | null;
          pickup_lat?: number | null;
          pickup_lon?: number | null;
          drop_lat?: number | null;
          drop_lon?: number | null;
          pickup_location?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: any[];
      };
      profiles: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          whatsapp: boolean;
          instagram: string;
          telegram: string;
          bio: string;
          avatar_url: string;
          rating: number;
          unlocked_ids: string[];
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
    };
  };
}
