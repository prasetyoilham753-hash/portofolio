import { auth } from "../../services/firebase/config";
import { DateRangeOption, AnalyticsReportResponse } from "./types";

export async function fetchAnalyticsReport(dateRange: DateRangeOption = "28days"): Promise<AnalyticsReportResponse> {
  try {
    const currentUser = auth.currentUser;
    let idToken = "";
    if (currentUser) {
      idToken = await currentUser.getIdToken();
    }

    const response = await fetch(`/api/analytics/report?range=${dateRange}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `Server error (${response.status})`;
      try {
        const jsonErr = JSON.parse(errorText);
        if (jsonErr.error) errorMsg = jsonErr.error;
      } catch (e) {
        if (errorText) errorMsg = errorText;
      }

      return {
        success: false,
        propertyId: "555955840",
        dateRange,
        hasCredentials: false,
        hasData: false,
        error: errorMsg,
        overview: {
          activeUsers: 0,
          totalUsers: 0,
          sessions: 0,
          screenPageViews: 0,
          averageEngagementTime: 0,
          eventCount: 0,
        },
        countries: [],
        cities: [],
        devices: [],
        browsers: [],
        trafficSources: [],
        landingPages: [],
        topPages: [],
        events: [],
        realtime: {
          activeUsersLast30Min: 0,
          topRealtimePages: [],
          realtimeEvents: [],
        },
      };
    }

    const data: AnalyticsReportResponse = await response.json();
    return data;
  } catch (err: any) {
    console.error("fetchAnalyticsReport failed:", err);
    return {
      success: false,
      propertyId: "555955840",
      dateRange,
      hasCredentials: false,
      hasData: false,
      error: err?.message || "Gagal menghubungi server endpoint analytics.",
      overview: {
        activeUsers: 0,
        totalUsers: 0,
        sessions: 0,
        screenPageViews: 0,
        averageEngagementTime: 0,
        eventCount: 0,
      },
      countries: [],
      cities: [],
      devices: [],
      browsers: [],
      trafficSources: [],
      landingPages: [],
      topPages: [],
      events: [],
      realtime: {
        activeUsersLast30Min: 0,
        topRealtimePages: [],
        realtimeEvents: [],
      },
    };
  }
}
