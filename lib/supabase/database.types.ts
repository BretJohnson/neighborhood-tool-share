export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];

export type Database = {
  public: {
    Tables: {
      tools: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          model: string | null;
          name: string;
          owner_id: string;
          photo_url: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          model?: string | null;
          name: string;
          owner_id: string;
          photo_url?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          model?: string | null;
          name?: string;
          owner_id?: string;
          photo_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tools_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          address: string;
          agreed_to_rules_at: string;
          created_at: string;
          email: string | null;
          facebook_id: string;
          full_name: string;
          id: string;
          phone_number: string;
          updated_at: string;
        };
        Insert: {
          address: string;
          agreed_to_rules_at: string;
          created_at?: string;
          email?: string | null;
          facebook_id: string;
          full_name: string;
          id?: string;
          phone_number: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          agreed_to_rules_at?: string;
          created_at?: string;
          email?: string | null;
          facebook_id?: string;
          full_name?: string;
          id?: string;
          phone_number?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_tools: {
        Args: {
          search_query: string;
        };
        Returns: Database["public"]["Tables"]["tools"]["Row"][];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type UsersRow = Database["public"]["Tables"]["users"]["Row"];
export type ToolsRow = Database["public"]["Tables"]["tools"]["Row"];
export type ToolWithOwner = ToolsRow & {
  owner: UsersRow;
};
