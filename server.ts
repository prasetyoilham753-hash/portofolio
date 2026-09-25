import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(cors());
app.use(express.json());

// Helper to get initialized Google Analytics Data API client & property ID
function getAnalyticsClient() {
  const propertyId = process.env.GA_PROPERTY_ID || "555955840";
  
  let credentials: any = null;

  if (process.env.GA_SERVICE_ACCOUNT_KEY) {
    try {
      const raw = process.env.GA_SERVICE_ACCOUNT_KEY.trim();
      const decoded = raw.startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf-8');
      credentials = JSON.parse(decoded);
    } catch (e) {
      console.warn("[Analytics API] Error parsing GA_SERVICE_ACCOUNT_KEY:", e);
    }
  } else if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GA_CLIENT_EMAIL.trim(),
      private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n').trim(),
    };
  }

  if (credentials && credentials.client_email && credentials.private_key) {
    try {
      const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
      return { client: analyticsDataClient, propertyId, hasCredentials: true };
    } catch (err) {
      console.error("[Analytics API] Failed to initialize BetaAnalyticsDataClient:", err);
    }
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const analyticsDataClient = new BetaAnalyticsDataClient();
      return { client: analyticsDataClient, propertyId, hasCredentials: true };
    } catch (err) {
      console.error("[Analytics API] Failed to initialize default credentials client:", err);
    }
  }

  return { client: null, propertyId, hasCredentials: false };
}

// Convert dateRange query param to GA4 date range string
function parseDateRange(range: string): { startDate: string; endDate: string } {
  switch (range) {
    case 'today':
      return { startDate: 'today', endDate: 'today' };
    case '7days':
      return { startDate: '7daysAgo', endDate: 'today' };
    case '90days':
      return { startDate: '90daysAgo', endDate: 'today' };
    case '30days':
      return { startDate: '30daysAgo', endDate: 'today' };
    case '28days':
    default:
      return { startDate: '28daysAgo', endDate: 'today' };
  }
}

// GET /api/analytics/report
app.get('/api/analytics/report', async (req: Request, res: Response) => {
  const rangeParam = (req.query.range as string) || '28days';
  const { startDate, endDate } = parseDateRange(rangeParam);
  const { client, propertyId, hasCredentials } = getAnalyticsClient();

  const emptyResponse = {
    success: true,
    propertyId,
    dateRange: rangeParam,
    hasCredentials,
    hasData: false,
    error: hasCredentials 
      ? undefined 
      : "Credential Google Analytics belum dikonfigurasi di environment variables (GA_CLIENT_EMAIL & GA_PRIVATE_KEY atau GA_SERVICE_ACCOUNT_KEY).",
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

  if (!client || !hasCredentials) {
    return res.json(emptyResponse);
  }

  try {
    const formattedProperty = `properties/${propertyId}`;

    // 1. Overview metrics
    const [overviewReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'userEngagementDuration' },
        { name: 'eventCount' },
      ],
    });

    const overviewRow = overviewReport.rows?.[0]?.metricValues || [];
    const activeUsers = parseInt(overviewRow[0]?.value || '0', 10);
    const totalUsers = parseInt(overviewRow[1]?.value || '0', 10);
    const sessions = parseInt(overviewRow[2]?.value || '0', 10);
    const screenPageViews = parseInt(overviewRow[3]?.value || '0', 10);
    const totalDuration = parseFloat(overviewRow[4]?.value || '0');
    const eventCount = parseInt(overviewRow[5]?.value || '0', 10);
    const averageEngagementTime = activeUsers > 0 ? Math.round(totalDuration / activeUsers) : 0;

    // 2. Countries
    const [countryReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 7,
    });
    const countries = (countryReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 3. Cities
    const [cityReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'city' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 7,
    });
    const cities = (cityReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 4. Device Categories
    const [deviceReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 5,
    });
    const devices = (deviceReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 5. Browsers
    const [browserReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'browser' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 5,
    });
    const browsers = (browserReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || 'Unknown',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 6. Traffic Sources
    const [trafficReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSourceMedium' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 7,
    });
    const trafficSources = (trafficReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || '(direct / none)',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 7. Landing Pages
    const [landingReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'landingPage' }],
      metrics: [{ name: 'sessions' }],
      limit: 7,
    });
    const landingPages = (landingReport.rows || []).map(r => ({
      name: r.dimensionValues?.[0]?.value || '/',
      value: parseInt(r.metricValues?.[0]?.value || '0', 10),
    }));

    // 8. Top Pages
    const [pagesReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      limit: 10,
    });
    const topPages = (pagesReport.rows || []).map(r => ({
      pagePath: r.dimensionValues?.[0]?.value || '/',
      pageTitle: r.dimensionValues?.[1]?.value || 'Untitled',
      screenPageViews: parseInt(r.metricValues?.[0]?.value || '0', 10),
      activeUsers: parseInt(r.metricValues?.[1]?.value || '0', 10),
    }));

    // 9. Custom Events
    const [eventsReport] = await client.runReport({
      property: formattedProperty,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }, { name: 'activeUsers' }],
      limit: 15,
    });

    const KEY_EVENTS = [
      'page_view',
      'click_download_cv',
      'click_github',
      'click_linkedin',
      'click_instagram',
      'click_reddit',
      'project_view'
    ];

    const rawEventsMap = new Map<string, { eventCount: number; eventUsers: number }>();
    (eventsReport.rows || []).forEach(r => {
      const name = r.dimensionValues?.[0]?.value || '';
      if (name) {
        rawEventsMap.set(name, {
          eventCount: parseInt(r.metricValues?.[0]?.value || '0', 10),
          eventUsers: parseInt(r.metricValues?.[1]?.value || '0', 10),
        });
      }
    });

    // Ensure all key events are present in output list
    const eventsList = KEY_EVENTS.map(eventName => {
      const data = rawEventsMap.get(eventName) || { eventCount: 0, eventUsers: 0 };
      return {
        eventName,
        eventCount: data.eventCount,
        eventUsers: data.eventUsers,
        isKeyTracked: true,
      };
    });

    // Include other events captured by GA4
    rawEventsMap.forEach((data, eventName) => {
      if (!KEY_EVENTS.includes(eventName)) {
        eventsList.push({
          eventName,
          eventCount: data.eventCount,
          eventUsers: data.eventUsers,
          isKeyTracked: false,
        });
      }
    });

    // 10. Realtime Report
    let realtimeData = {
      activeUsersLast30Min: 0,
      topRealtimePages: [] as { pagePath: string; activeUsers: number }[],
      realtimeEvents: [] as { eventName: string; eventCount: number }[],
    };

    try {
      const [realtimeReport] = await client.runRealtimeReport({
        property: formattedProperty,
        metrics: [{ name: 'activeUsers' }],
      });
      realtimeData.activeUsersLast30Min = parseInt(realtimeReport.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

      const [realtimePagesReport] = await client.runRealtimeReport({
        property: formattedProperty,
        dimensions: [{ name: 'unifiedScreenName' }],
        metrics: [{ name: 'activeUsers' }],
        limit: 5,
      });
      realtimeData.topRealtimePages = (realtimePagesReport.rows || []).map(r => ({
        pagePath: r.dimensionValues?.[0]?.value || '/',
        activeUsers: parseInt(r.metricValues?.[0]?.value || '0', 10),
      }));

      const [realtimeEventsReport] = await client.runRealtimeReport({
        property: formattedProperty,
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        limit: 5,
      });
      realtimeData.realtimeEvents = (realtimeEventsReport.rows || []).map(r => ({
        eventName: r.dimensionValues?.[0]?.value || '',
        eventCount: parseInt(r.metricValues?.[0]?.value || '0', 10),
      }));
    } catch (rtErr) {
      console.warn("[Analytics API] Realtime report query warning:", rtErr);
    }

    const hasData = activeUsers > 0 || totalUsers > 0 || screenPageViews > 0 || eventsList.some(e => e.eventCount > 0);

    return res.json({
      success: true,
      propertyId,
      dateRange: rangeParam,
      hasCredentials: true,
      hasData,
      overview: {
        activeUsers,
        totalUsers,
        sessions,
        screenPageViews,
        averageEngagementTime,
        eventCount,
      },
      countries,
      cities,
      devices,
      browsers,
      trafficSources,
      landingPages,
      topPages,
      events: eventsList,
      realtime: realtimeData,
    });

  } catch (err: any) {
    console.error("[Analytics API] Error executing GA4 report:", err);
    return res.json({
      ...emptyResponse,
      hasCredentials: true,
      error: `GA4 Data API Query Error: ${err?.message || String(err)}`,
    });
  }
});

// Setup Vite Dev server middleware or static server
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const httpServer = http.createServer(app);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Applet running at http://0.0.0.0:${PORT}`);
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Applet running at http://0.0.0.0:${PORT}`);
    });
  }
}

setupServer().catch((err) => {
  console.error("[Server] Failed to start server:", err);
});
