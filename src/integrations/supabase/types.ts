export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          rating: number;
          matches_played: number;
          wins: number;
          win_rate: number;
          position: 'Singles' | 'Doubles' | 'Both';
          age: number;
          created_at: string;
          updated_at: string;
          user_id: string;
          last_played_at: string | null;
          streak_count: number;
        };
        Insert: {
          id?: string;
          name: string;
          rating?: number;
          matches_played?: number;
          wins?: number;
          win_rate?: number;
          position?: 'Singles' | 'Doubles' | 'Both';
          age: number;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          last_played_at?: string | null;
          streak_count?: number;
        };
        Update: {
          id?: string;
          name?: string;
          rating?: number;
          matches_played?: number;
          wins?: number;
          win_rate?: number;
          position?: 'Singles' | 'Doubles' | 'Both';
          age?: number;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          last_played_at?: string | null;
          streak_count?: number;
        };
      };
      matches: {
        Row: {
          id: string;
          team1_id: string;
          team2_id: string;
          score: string;
          winner: string;
          match_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team1_id: string;
          team2_id: string;
          score: string;
          winner: string;
          match_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team1_id?: string;
          team2_id?: string;
          score?: string;
          winner?: string;
          match_date?: string;
          created_at?: string;
        };
      };
      team_a_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          created_at?: string;
        };
      };
      team_b_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          created_at?: string;
        };
      };
      match_history: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          date: string;
          rating_before: number;
          rating_after: number;
          rating_change: number;
          is_winner: boolean;
          score_difference: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          date: string;
          rating_before: number;
          rating_after: number;
          rating_change: number;
          is_winner: boolean;
          score_difference: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          player_id?: string;
          date?: string;
          rating_before?: number;
          rating_after?: number;
          rating_change?: number;
          is_winner?: boolean;
          score_difference?: number;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
