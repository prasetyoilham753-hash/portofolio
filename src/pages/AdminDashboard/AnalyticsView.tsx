import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  Clock, 
  Eye, 
  Activity, 
  Globe, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  TrendingUp, 
  Layers, 
  Compass, 
  MousePointerClick, 
  AlertCircle, 
  Key, 
  Check, 
  ExternalLink,
  ShieldCheck,
  FileText,
  MapPin,
  Sparkles
} from "lucide-react";
import { DateRangeOption, AnalyticsReportResponse } from "../../features/analytics/types";
import { fetchAnalyticsReport } from "../../features/analytics/api";

const DATE_RANGE_LABELS: { id: DateRangeOption; label: string }[] = [
  { id: 'today', label: 'Hari Ini' },
  { id: '7days', label: '7 Hari Terakhir' },
  { id: '28days', label: '28 Hari Terakhir' },
  { id: '30days', label: '30 Hari Terakhir' },
  { id: '90days', label: '90 Hari Terakhir' },
];

export function AnalyticsView() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('28days');
  const [data, setData] = useState<AnalyticsReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  const loadReport = async (range: DateRangeOption = dateRange, isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await fetchAnalyticsReport(range);
      setData(result);
    } catch (err) {
      console.error("Error loading analytics report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReport(dateRange, false);
  }, [dateRange]);

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return "0s";
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return "0";
    return num.toLocaleString('id-ID');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[rgba(6,15,35,0.45)] border border-white/10 backdrop-blur-md shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-display font-medium text-white tracking-tight flex items-center gap-2">
              Google Analytics 4 Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#7DB3FF]/15 border border-[#7DB3FF]/30 text-[#7DB3FF]">
              Property ID: {data?.propertyId || "555955840"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary font-light">
            Statistik pengunjung real-time, lalu lintas geografis, dan lacak performa event di <code className="text-[#7DB3FF]">bprasety_.com</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Period filter buttons */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
            {DATE_RANGE_LABELS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  dateRange === opt.id
                    ? 'bg-[#7DB3FF] text-slate-950 font-semibold shadow-[0_0_12px_rgba(125,179,255,0.4)]'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={() => loadReport(dateRange, true)}
            disabled={loading || refreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Refresh Data Analytics"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-[#7DB3FF]" : ""} />
          </button>
        </div>
      </div>

      {/* Setup Notice / Alert Banner if Credentials Missing */}
      {data && !data.hasCredentials && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col gap-3 backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Key size={18} className="text-amber-400 shrink-0" />
              <h3 className="text-sm font-semibold text-amber-100">
                Konfigurasi Service Account GA4 Belum Ditemukan
              </h3>
            </div>
            <button
              onClick={() => setShowSetupGuide(!showSetupGuide)}
              className="text-xs font-mono px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 cursor-pointer"
            >
              {showSetupGuide ? "Sembunyikan Panduan" : "Lihat Panduan Setup"}
            </button>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            Untuk menampilkan statistik langsung dari Google Analytics Data API secara aman, server membutuhkan <b>GA_CLIENT_EMAIL</b> & <b>GA_PRIVATE_KEY</b> (atau <b>GA_SERVICE_ACCOUNT_KEY</b>) pada environment variables backend server Anda.
          </p>

          {showSetupGuide && (
            <div className="mt-2 p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/90 space-y-2 font-mono leading-relaxed">
              <p className="text-amber-300 font-bold font-sans">Langkah Mudah Menghubungkan Google Analytics Data API:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-text-secondary">
                <li>Buka <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-[#7DB3FF] underline">Google Cloud Console</a> pada project Firebase <b>bintangprasetyo-porto</b>.</li>
                <li>Aktifkan <b>Google Analytics Data API</b>.</li>
                <li>Buat Service Account & unduh file kunci JSON Service Account.</li>
                <li>Tambahkan Service Account email sebagai viewer/viewer penganalisis di <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="text-[#7DB3FF] underline">Google Analytics Admin (Property Settings - Access Management)</a> untuk Property ID <code className="text-amber-300">555955840</code>.</li>
                <li>Isi variable environment di server/Vercel/hosting:
                  <div className="p-2 my-1 rounded bg-black/60 text-[11px] text-[#7DB3FF]">
                    GA_PROPERTY_ID=555955840<br />
                    GA_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com<br />
                    GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
                  </div>
                </li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Main Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
          ))
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Active Users</span>
                <Users size={15} className="text-[#7DB3FF]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatNumber(data?.overview.activeUsers || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Pengunjung Aktif</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Total Users</span>
                <TrendingUp size={15} className="text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatNumber(data?.overview.totalUsers || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Total Pengunjung</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Sessions</span>
                <Compass size={15} className="text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatNumber(data?.overview.sessions || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Sesi Kunjungan</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Page Views</span>
                <Eye size={15} className="text-indigo-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatNumber(data?.overview.screenPageViews || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Tayangan Halaman</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Avg. Duration</span>
                <Clock size={15} className="text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatSeconds(data?.overview.averageEngagementTime || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Rata-rata Waktu Akses</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col justify-between gap-2 shadow-md hover:border-[#7DB3FF]/40 transition-all">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-[11px] font-mono uppercase tracking-wider">Event Count</span>
                <MousePointerClick size={15} className="text-rose-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {formatNumber(data?.overview.eventCount || 0)}
                </span>
                <span className="text-[10px] text-text-secondary font-light mt-0.5">Interaksi Event</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Realtime Active Monitor Section */}
      <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.7)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <h3 className="text-sm font-bold font-display text-white tracking-tight">
              Realtime Activity (30 Menit Terakhir)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {formatNumber(data?.realtime?.activeUsersLast30Min || 0)} Realtime Active Users
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Realtime Pages */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[11px] font-mono uppercase text-text-muted flex items-center gap-1.5">
              <FileText size={13} className="text-[#7DB3FF]" />
              <span>Active Pages Right Now</span>
            </span>
            {(!data?.realtime?.topRealtimePages || data.realtime.topRealtimePages.length === 0) ? (
              <p className="text-xs text-text-muted font-light italic py-2">Belum ada aktivitas halaman real-time.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {data.realtime.topRealtimePages.map((pg, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="font-mono text-white/90 truncate max-w-[220px]">{pg.pagePath}</span>
                    <span className="font-mono text-emerald-400 font-medium">{pg.activeUsers} users</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Realtime Events */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-black/25 border border-white/5">
            <span className="text-[11px] font-mono uppercase text-text-muted flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Realtime Events Stream</span>
            </span>
            {(!data?.realtime?.realtimeEvents || data.realtime.realtimeEvents.length === 0) ? (
              <p className="text-xs text-text-muted font-light italic py-2">Belum ada event terdeteksi dalam 30 menit terakhir.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {data.realtime.realtimeEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <span className="font-mono text-[#7DB3FF]">{ev.eventName}</span>
                    <span className="font-mono text-white/80 font-medium">{ev.eventCount} count</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traffic Demographics & Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Country Breakdown */}
        <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-2">
              <Globe size={15} className="text-[#7DB3FF]" />
              <span>Users berdasarkan Negara</span>
            </span>
            <span className="text-[11px] font-mono text-text-muted">Top Countries</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-6 rounded bg-white/5 animate-pulse" />)}
            </div>
          ) : (!data?.countries || data.countries.length === 0) ? (
            <p className="text-xs text-text-muted font-light italic py-4 text-center">Tidak ada data negara.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.countries.map((c, i) => {
                const maxVal = data.countries[0]?.value || 1;
                const pct = Math.round((c.value / maxVal) * 100);
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/90 font-medium truncate">{c.name}</span>
                      <span className="font-mono text-[#7DB3FF] font-semibold">{formatNumber(c.value)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#7DB3FF] h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* City Breakdown */}
        <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-2">
              <MapPin size={15} className="text-emerald-400" />
              <span>Users berdasarkan Kota</span>
            </span>
            <span className="text-[11px] font-mono text-text-muted">Top Cities</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-6 rounded bg-white/5 animate-pulse" />)}
            </div>
          ) : (!data?.cities || data.cities.length === 0) ? (
            <p className="text-xs text-text-muted font-light italic py-4 text-center">Tidak ada data kota.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {data.cities.map((c, i) => {
                const maxVal = data.cities[0]?.value || 1;
                const pct = Math.round((c.value / maxVal) * 100);
                return (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/90 font-medium truncate">{c.name}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{formatNumber(c.value)}</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device Categories & Browsers */}
        <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-2">
              <Smartphone size={15} className="text-indigo-400" />
              <span>Perangkat & Browser</span>
            </span>
            <span className="text-[11px] font-mono text-text-muted">Devices</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(n => <div key={n} className="h-6 rounded bg-white/5 animate-pulse" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Devices */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase text-text-muted">Device Category</span>
                {(!data?.devices || data.devices.length === 0) ? (
                  <span className="text-xs text-text-muted italic">No data</span>
                ) : (
                  data.devices.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="capitalize text-white/90">{d.name}</span>
                      <span className="font-mono text-indigo-300 font-semibold">{formatNumber(d.value)} users</span>
                    </div>
                  ))
                )}
              </div>

              {/* Browsers */}
              <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                <span className="text-[10px] font-mono uppercase text-text-muted">Browser</span>
                {(!data?.browsers || data.browsers.length === 0) ? (
                  <span className="text-xs text-text-muted italic">No data</span>
                ) : (
                  data.browsers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <span className="text-white/90">{b.name}</span>
                      <span className="font-mono text-white/70">{formatNumber(b.value)} users</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Sources & Top Pages Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-2">
              <Compass size={15} className="text-cyan-400" />
              <span>Sumber Traffic (Source / Medium)</span>
            </span>
            <span className="text-[11px] font-mono text-text-muted">Acquisition</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => <div key={n} className="h-8 rounded bg-white/5 animate-pulse" />)}
            </div>
          ) : (!data?.trafficSources || data.trafficSources.length === 0) ? (
            <p className="text-xs text-text-muted font-light italic py-4 text-center">Belum ada data sumber traffic.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.trafficSources.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs">
                  <span className="font-mono text-cyan-300 font-medium truncate max-w-[280px]">{t.name}</span>
                  <span className="font-mono text-white font-bold">{formatNumber(t.value)} users</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Landing Pages */}
        <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-white font-display flex items-center gap-2">
              <FileText size={15} className="text-amber-400" />
              <span>Halaman Mendarat (Landing Pages)</span>
            </span>
            <span className="text-[11px] font-mono text-text-muted">Landing</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(n => <div key={n} className="h-8 rounded bg-white/5 animate-pulse" />)}
            </div>
          ) : (!data?.landingPages || data.landingPages.length === 0) ? (
            <p className="text-xs text-text-muted font-light italic py-4 text-center">Belum ada data landing page.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.landingPages.map((lp, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs">
                  <span className="font-mono text-amber-200 font-medium truncate max-w-[280px]">{lp.name}</span>
                  <span className="font-mono text-white font-bold">{formatNumber(lp.value)} sessions</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-bold text-white font-display flex items-center gap-2">
            <Eye size={16} className="text-[#7DB3FF]" />
            <span>Halaman Paling Banyak Dikunjungi (Top Pages)</span>
          </span>
          <span className="text-[11px] font-mono text-text-muted">Page Performance</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-10 rounded bg-white/5 animate-pulse" />)}
          </div>
        ) : (!data?.topPages || data.topPages.length === 0) ? (
          <p className="text-xs text-text-muted font-light italic py-6 text-center">Tidak ada data halaman.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted font-mono uppercase">
                  <th className="pb-3 font-medium">Page Path</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Page Title</th>
                  <th className="pb-3 font-medium text-right">Page Views</th>
                  <th className="pb-3 font-medium text-right">Active Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.topPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-mono text-[#7DB3FF] font-medium">{page.pagePath}</td>
                    <td className="py-3 text-white/80 hidden sm:table-cell truncate max-w-[250px]">{page.pageTitle}</td>
                    <td className="py-3 text-right font-mono text-white font-bold">{formatNumber(page.screenPageViews)}</td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold">{formatNumber(page.activeUsers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Key Custom Events Tracking Grid */}
      <div className="p-5 rounded-2xl bg-[rgba(8,18,38,0.6)] border border-white/10 backdrop-blur-md flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <MousePointerClick size={16} className="text-rose-400" />
            <h3 className="text-xs font-bold text-white font-display">
              Pelacakan Event Penting (Custom Events)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">Custom Analytics Events</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(n => <div key={n} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (!data?.events || data.events.length === 0) ? (
          <p className="text-xs text-text-muted font-light italic py-6 text-center">Belum ada data event tercatat.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {data.events.map((ev) => (
              <div 
                key={ev.eventName}
                className={`p-3.5 rounded-xl border backdrop-blur-sm flex flex-col justify-between gap-1.5 transition-all ${
                  ev.isKeyTracked 
                    ? 'bg-black/30 border-[#7DB3FF]/30 hover:border-[#7DB3FF]/60'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-semibold text-[#7DB3FF] truncate">
                    {ev.eventName}
                  </span>
                  {ev.isKeyTracked && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Event Utama Tlacat" />
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xl font-display font-bold text-white tracking-tight">
                    {formatNumber(ev.eventCount)}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {formatNumber(ev.eventUsers)} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
