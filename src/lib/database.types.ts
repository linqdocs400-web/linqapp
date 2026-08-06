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
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          logo_url: string | null;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string | null;
          user_id: string | null;
          full_name: string;
          city: string;
          profession: string;
          organization: string;
          bio: string;
          interests: string[];
          linkedin_url: string | null;
          photo_url: string | null;
          pickup_location: string | null;
          drop_location: string | null;
          has_vehicle: boolean | null;
          vehicle_details: string | null;
          role: string | null;
          seats: number | null;
          created_at: string | null;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      event_connections: {
        Row: {
          id: string;
          event_id: string | null;
          requester_id: string | null;
          receiver_id: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: any;
        Update: any;
        Relationships: any[];
      };
      hotspots: { Row: { id: string, name: string, type: string }, Insert: any, Update: any, Relationships: any[] };
      hotspot_members: { Row: { id: string, hotspot_id: string, user_id: string, owner_id?: string, role: string, name?: string, connect_method?: string, connect_id?: string, bio?: string }, Insert: any, Update: any, Relationships: any[] };
      connection_requests: { Row: { id: string, sender_id: string, receiver_id: string, status: string, profile_id?: string }, Insert: any, Update: any, Relationships: any[] };
    };
  };
}
