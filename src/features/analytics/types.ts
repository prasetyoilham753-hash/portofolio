export type DateRangeOption = 'today' | '7days' | '28days' | '30days' | '90days';

export interface OverviewMetrics {
  activeUsers: number;
  totalUsers: number;
  sessions: number;
  screenPageViews: number;
  averageEngagementTime: number; // in seconds
  eventCount: number;
}

export interface DimensionMetricItem {
  name: string;
  value: number;
  percentage?: number;
}

export interface TopPageItem {
  pagePath: string;
  pageTitle: string;
  screenPageViews: number;
  activeUsers: number;
}

export interface CustomEventItem {
  eventName: string;
  eventCount: number;
  eventUsers: number;
  isKeyTracked?: boolean;
}

export interface RealtimeData {
  activeUsersLast30Min: number;
  topRealtimePages: { pagePath: string; activeUsers: number }[];
  realtimeEvents: { eventName: string; eventCount: number }[];
}

export interface AnalyticsReportResponse {
  success: boolean;
  propertyId: string;
  dateRange: DateRangeOption;
  hasCredentials: boolean;
  hasData: boolean;
  error?: string;
  overview: OverviewMetrics;
  countries: DimensionMetricItem[];
  cities: DimensionMetricItem[];
  devices: DimensionMetricItem[];
  browsers: DimensionMetricItem[];
  trafficSources: DimensionMetricItem[];
  landingPages: DimensionMetricItem[];
  topPages: TopPageItem[];
  events: CustomEventItem[];
  realtime: RealtimeData;
}
