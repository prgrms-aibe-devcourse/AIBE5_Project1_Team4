/**
 * Trip Planner Domain Types
 * Convenience type aliases and extended types for application use
 */

import type { Database } from './database.types';

// =====================================================
// Convenience Type Aliases
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// =====================================================
// Entity Type Aliases
// =====================================================

export type Profile = Tables<'profiles'>;
export type Trip = Tables<'trips'>;
export type TripMember = Tables<'trip_members'>;
export type Place = Tables<'places'>;
export type TripDay = Tables<'trip_days'>;
export type ScheduleItem = Tables<'schedule_items'>;
export type Theme = Tables<'themes'>;
export type Region = Tables<'regions'>;
export type TripTheme = Tables<'trip_themes'>;
export type TripRegion = Tables<'trip_regions'>;
export type TripLike = Tables<'trip_likes'>;
export type TripBookmark = Tables<'trip_bookmarks'>;
export type Review = Tables<'reviews'>;
export type TripInviteLink = Tables<'trip_invite_links'>;
export type AiQuerySuggestion = Tables<'ai_query_suggestions'>;
export type RateLimit = Tables<'rate_limits'>;

// =====================================================
// Insert Type Aliases
// =====================================================

export type ProfileInsert = InsertTables<'profiles'>;
export type TripInsert = InsertTables<'trips'>;
export type TripMemberInsert = InsertTables<'trip_members'>;
export type PlaceInsert = InsertTables<'places'>;
export type TripDayInsert = InsertTables<'trip_days'>;
export type ScheduleItemInsert = InsertTables<'schedule_items'>;
export type ReviewInsert = InsertTables<'reviews'>;
export type TripInviteLinkInsert = InsertTables<'trip_invite_links'>;

// =====================================================
// Update Type Aliases
// =====================================================

export type ProfileUpdate = UpdateTables<'profiles'>;
export type TripUpdate = UpdateTables<'trips'>;
export type TripMemberUpdate = UpdateTables<'trip_members'>;
export type PlaceUpdate = UpdateTables<'places'>;
export type TripDayUpdate = UpdateTables<'trip_days'>;
export type ScheduleItemUpdate = UpdateTables<'schedule_items'>;
export type ReviewUpdate = UpdateTables<'reviews'>;

// =====================================================
// Enum Type Aliases
// =====================================================

export type TripVisibility = Trip['visibility'];
export type MemberRole = TripMember['role'];
export type ReviewTargetType = Review['target_type'];

// =====================================================
// Extended Types (Query Result Types with Relations)
// Supabase 쿼리 결과에서 관계 데이터를 포함한 타입
// =====================================================

export type TripWithAuthor = Trip & {
  author: Profile;
};

export type TripWithMembers = Trip & {
  members: (TripMember & { user: Profile })[];
};

export type TripWithDays = Trip & {
  days: TripDay[];
};

export type TripDayWithSchedule = TripDay & {
  schedule_items: (ScheduleItem & { place: Place })[];
};

export type TripFull = Trip & {
  author: Profile;
  members: (TripMember & { user: Profile })[];
  days: TripDayWithSchedule[];
  themes: Theme[];
  regions: Region[];
  like_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

export type ReviewWithAuthor = Review & {
  author: Profile;
};

export type PlaceWithReviews = Place & {
  reviews: ReviewWithAuthor[];
  average_rating: number;
  review_count: number;
};
