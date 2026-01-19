// Shared types for Edge Functions

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface Place {
  id?: string
  provider: string
  provider_place_id: string
  name: string
  category?: string
  address?: string
  road_address?: string
  phone?: string
  latitude: number
  longitude: number
  raw_data?: Record<string, unknown>
}

export interface KakaoPlace {
  id: string
  place_name: string
  category_name?: string
  category_group_code?: string
  category_group_name?: string
  phone?: string
  address_name?: string
  road_address_name?: string
  x: string // longitude
  y: string // latitude
  place_url?: string
  distance?: string
}

export interface Review {
  author_id: string
  target_type: 'trip' | 'place'
  trip_id?: string
  place_id?: string
  rating: number
  content?: string
  visited_on?: string
  photo_urls?: string[]
}
