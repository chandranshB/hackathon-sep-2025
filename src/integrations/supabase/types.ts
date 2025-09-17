export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      citizen_reports: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          fine_amount: number | null
          id: string
          investigation_notes: string | null
          latitude: number
          location: unknown
          location_name: string | null
          longitude: number
          photo_urls: string[] | null
          priority: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
          violation_type: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          fine_amount?: number | null
          id?: string
          investigation_notes?: string | null
          latitude: number
          location: unknown
          location_name?: string | null
          longitude: number
          photo_urls?: string[] | null
          priority?: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
          violation_type: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          fine_amount?: number | null
          id?: string
          investigation_notes?: string | null
          latitude?: number
          location?: unknown
          location_name?: string | null
          longitude?: number
          photo_urls?: string[] | null
          priority?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
          violation_type?: string
        }
        Relationships: []
      }
      enforcement_actions: {
        Row: {
          action_taken: string
          company_name: string | null
          created_at: string
          evidence_urls: string[] | null
          fine_amount: number
          id: string
          latitude: number
          location: string
          longitude: number
          officer_name: string | null
          report_id: string | null
          status: string
          updated_at: string
          vehicle_number: string | null
          violation_type: string
        }
        Insert: {
          action_taken: string
          company_name?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          fine_amount: number
          id?: string
          latitude: number
          location: string
          longitude: number
          officer_name?: string | null
          report_id?: string | null
          status?: string
          updated_at?: string
          vehicle_number?: string | null
          violation_type: string
        }
        Update: {
          action_taken?: string
          company_name?: string | null
          created_at?: string
          evidence_urls?: string[] | null
          fine_amount?: number
          id?: string
          latitude?: number
          location?: string
          longitude?: number
          officer_name?: string | null
          report_id?: string | null
          status?: string
          updated_at?: string
          vehicle_number?: string | null
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "enforcement_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "citizen_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_pollution_zones: {
        Row: {
          coordinates: unknown
          created_at: string | null
          current_aqi: number | null
          forecast: Json | null
          heatmap_intensity: number | null
          id: string
          last_updated: string | null
          latitude: number
          level: string | null
          longitude: number
          name: string
          reports_count: number | null
          spread_radius: number | null
          updated_at: string | null
        }
        Insert: {
          coordinates: unknown
          created_at?: string | null
          current_aqi?: number | null
          forecast?: Json | null
          heatmap_intensity?: number | null
          id?: string
          last_updated?: string | null
          latitude: number
          level?: string | null
          longitude: number
          name: string
          reports_count?: number | null
          spread_radius?: number | null
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown
          created_at?: string | null
          current_aqi?: number | null
          forecast?: Json | null
          heatmap_intensity?: number | null
          id?: string
          last_updated?: string | null
          latitude?: number
          level?: string | null
          longitude?: number
          name?: string
          reports_count?: number | null
          spread_radius?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pollution_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          aqi_value: number | null
          created_at: string
          description: string
          id: string
          latitude: number
          location: unknown
          longitude: number
          reading_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          threshold_exceeded: string | null
          title: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          aqi_value?: number | null
          created_at?: string
          description: string
          id?: string
          latitude: number
          location: unknown
          longitude: number
          reading_id?: string | null
          resolved_at?: string | null
          severity: string
          status?: string
          threshold_exceeded?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          aqi_value?: number | null
          created_at?: string
          description?: string
          id?: string
          latitude?: number
          location?: unknown
          longitude?: number
          reading_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          threshold_exceeded?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pollution_alerts_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "pollution_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      pollution_readings: {
        Row: {
          aqi: number
          aqi_level: string
          battery_level: number | null
          calibration_status: string | null
          co: number | null
          created_at: string
          data_quality: string | null
          humidity: number | null
          id: string
          latitude: number
          location: unknown
          longitude: number
          no2: number | null
          o3: number | null
          pm10: number
          pm25: number
          sensor_id: string
          so2: number | null
          temperature: number | null
          timestamp: string
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          aqi: number
          aqi_level: string
          battery_level?: number | null
          calibration_status?: string | null
          co?: number | null
          created_at?: string
          data_quality?: string | null
          humidity?: number | null
          id?: string
          latitude: number
          location: unknown
          longitude: number
          no2?: number | null
          o3?: number | null
          pm10: number
          pm25: number
          sensor_id: string
          so2?: number | null
          temperature?: number | null
          timestamp?: string
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          aqi?: number
          aqi_level?: string
          battery_level?: number | null
          calibration_status?: string | null
          co?: number | null
          created_at?: string
          data_quality?: string | null
          humidity?: number | null
          id?: string
          latitude?: number
          location?: unknown
          longitude?: number
          no2?: number | null
          o3?: number | null
          pm10?: number
          pm25?: number
          sensor_id?: string
          so2?: number | null
          temperature?: number | null
          timestamp?: string
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      pollution_reports: {
        Row: {
          ai_analysis: Json | null
          coordinates: unknown
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          latitude: number
          longitude: number
          timestamp: string | null
          traffic_context: Json | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          weather_context: Json | null
        }
        Insert: {
          ai_analysis?: Json | null
          coordinates: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          latitude: number
          longitude: number
          timestamp?: string | null
          traffic_context?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          weather_context?: Json | null
        }
        Update: {
          ai_analysis?: Json | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          latitude?: number
          longitude?: number
          timestamp?: string | null
          traffic_context?: Json | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          weather_context?: Json | null
        }
        Relationships: []
      }
      pollution_zones: {
        Row: {
          aqi_critical_threshold: number | null
          aqi_warning_threshold: number | null
          created_at: string
          geometry: Json
          id: string
          is_active: boolean | null
          name: string
          population_density: number | null
          sensitive_receptors: string[] | null
          updated_at: string
          zone_type: string
        }
        Insert: {
          aqi_critical_threshold?: number | null
          aqi_warning_threshold?: number | null
          created_at?: string
          geometry: Json
          id?: string
          is_active?: boolean | null
          name: string
          population_density?: number | null
          sensitive_receptors?: string[] | null
          updated_at?: string
          zone_type: string
        }
        Update: {
          aqi_critical_threshold?: number | null
          aqi_warning_threshold?: number | null
          created_at?: string
          geometry?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          population_density?: number | null
          sensitive_receptors?: string[] | null
          updated_at?: string
          zone_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          location_name: string | null
          notification_preferences: Json | null
          phone_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          location_name?: string | null
          notification_preferences?: Json | null
          phone_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      route_cache: {
        Row: {
          activity_type: string
          clean_air_score: number | null
          created_at: string | null
          distance: number
          id: string
          route_points: Json
          start_latitude: number
          start_location: unknown
          start_longitude: number
          updated_at: string | null
        }
        Insert: {
          activity_type: string
          clean_air_score?: number | null
          created_at?: string | null
          distance: number
          id?: string
          route_points: Json
          start_latitude: number
          start_location: unknown
          start_longitude: number
          updated_at?: string | null
        }
        Update: {
          activity_type?: string
          clean_air_score?: number | null
          created_at?: string | null
          distance?: number
          id?: string
          route_points?: Json
          start_latitude?: number
          start_location?: unknown
          start_longitude?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          id: string
          latitude: number | null
          location: unknown | null
          longitude: number | null
          max_aqi_tolerance: number | null
          notification_radius: number | null
          notification_settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          max_aqi_tolerance?: number | null
          notification_radius?: number | null
          notification_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          max_aqi_tolerance?: number | null
          notification_radius?: number | null
          notification_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_aqi: {
        Args: {
          co_val?: number
          no2_val?: number
          o3_val?: number
          pm10_val: number
          pm25_val: number
          so2_val?: number
        }
        Returns: number
      }
      get_aqi_level: {
        Args: { aqi_value: number }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
