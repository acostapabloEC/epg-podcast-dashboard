import { useState, useEffect } from "react";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const PROXY = "/api/simplecast?endpoint=";

const PURPLE    = "#8b5cf6";
const PURPLE_DIM= "rgba(139,92,246,0.15)";
const GREEN     = "#3fb950";
const GREEN_DIM = "rgba(63,185,80,0.12)";
const RED       = "#f85149";
const RED_DIM   = "rgba(248,81,73,0.12)";
const BLUE      = "#58a6ff";
const GOLD      = "#c9a84c";
const MUTED     = "#8892a4";
const BORDER    = "rgba(255,255,255,0.07)";
const SURFACE   = "#111827";

function KpiCard({ source, label, value, accent, large, sub }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent || PURPLE, borderRadius: "12px 12px 0 0" }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase", marginBottom: 8 }}>{source}</div>
      <div style={{ fontSize: 13, color: "#a0aab4", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: large ? 52 : 40, fontWeight: 700, color: "#f0f6fc", lineHeight: 1, marginBottom: 10 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1a2235", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 13, color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const h = time.getHours() % 12 || 12;
  const m = String(time.getMinutes()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";
  return <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#f0f6fc", letterSpacing: 1 }}>{h}:{m} {ampm}</span>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${BORDER}`, borderTop: `3px solid ${PURPLE}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: MUTED }}>Loading Simplecast data...</div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const podRes = await fetch(`${PROXY}podcasts`);
        const podJson = await podRes.json();
        const podcast = podJson.collection?.[0];
        if (!podcast) throw new Error("No podcast found");
        const podId = podcast.id;

        const epRes = await fetch(`${PROXY}podcasts/${podId}/episodes?limit=10&status=published`);
        const epJson = await epRes.json();
        const episodes = epJson.collection || [];

        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const dlRes = await fetch(`${PROXY}analytics/downloads?podcast=${podId}&start_date=${thirtyDaysAgo}&end_date=${today}`);
        const dlJson = await dlRes.json();

        const dl7Res = await fetch(`${PROXY}analytics/downloads?podcast=${podId}&start_date=${sevenDaysAgo}&end_date=${today}`);
        const dl7Json = await dl7Res.json();

        const appRes = await fetch(`${PROXY}analytics/applications?podcast=${podId}&start_date=${thirtyDaysAgo}&end_date=${today}`);
        const appJson = await appRes.json();

        setData({
          podcast,
          episodes,
          downloads30: dlJson.total_downloads || 0,
          downloads7: dl7Json.total_downloads || 0,
          dailyDownloads: dlJson.by_interval || [],
          apps: appJson.collection?.slice(0, 5) || [],
        });
      } catch (err) {
        setError(err.message);
      }
    }
    fetchAll();
  }, []);

  if (error) return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: RED, marginBottom: 8 }}>Failed to load Simplecast data</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED }}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#0a0f1e", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#f0f6fc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #2a3445; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* HEADER */}
      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, background: PURPLE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff" }}>🎙</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Elite Partners Group — Podcast Performance</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Advisor Talk with Frank LaRosa · Simplecast · Live</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", background: PURPLE_DIM, color: PURPLE, padding: "5px 12px", borderRadius: 6, border: `1px solid rgba(139,92,246,0.2)` }}>Live Data</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: MUTED }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s infinite" }} />
            Simplecast API
          </div>
          <Clock />
        </div>
      </div>

      {!data ? <Spinner /> : (
        <div style={{ padding: "24px 28px", maxWidth: 1600, margin: "0 auto" }}>

          {/* ROW 1: KPI CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            <KpiCard source="Simplecast · All Time" label="Total Downloads" value={data.podcast.downloads_count?.toLocaleString() || "—"} accent={PURPLE} large />
            <KpiCard source="Simplecast · Last 30 Days" label="Downloads (30 Days)" value={data.downloads30.toLocaleString()} accent={PURPLE} />
            <KpiCard source="Simplecast · Last 7 Days" label="Downloads (7 Days)" value={data.downloads7.toLocaleString()} accent={BLUE} />
            <KpiCard source="Simplecast · Advisor Talk" label="Episodes Published" value={data.podcast.episodes_count?.toLocaleString() || "—"} accent={GREEN} sub="All time" />
          </div>

          {/* ROW 2: CHARTS */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Daily Downloads — Advisor Talk</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>Last 30 days · Simplecast Analytics</div>
              {data.dailyDownloads.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.dailyDownloads.map(d => ({ date: d.interval?.slice(5), downloads: d.downloads_total }))} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PURPLE} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                    <XAxis dataKey="date" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="downloads" name="Downloads" stroke={PURPLE} strokeWidth={2.5} fill="url(#dlGrad)" dot={false} activeDot={{ r: 5, fill: PURPLE }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12 }}>No daily data available</div>
              )}
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Top Listening Platforms</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 20 }}>Last 30 days · Share of downloads</div>
              {data.apps.length > 0 ? data.apps.map((app, i) => {
                const colors = [PURPLE, BLUE, GOLD, GREEN, RED];
                const total = data.apps.reduce((s, a) => s + (a.downloads_total || 0), 0);
                const pct = total > 0 ? Math.round((app.downloads_total / total) * 100) : 0;
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#f0f6fc" }}>{app.name || "Unknown"}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: MUTED }}>{pct}% · {(app.downloads_total || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: 3 }} />
                    </div>
                  </div>
                );
              }) : <div style={{ color: MUTED, fontSize: 12 }}>No platform data available</div>}
            </div>
          </div>

          {/* ROW 3: RECENT EPISODES */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Latest Episodes</div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>10 most recent · Simplecast</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {data.episodes.map((ep, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px", borderRadius: 8, background: i === 0 ? PURPLE_DIM : "rgba(255,255,255,0.02)", border: i === 0 ? `1px solid rgba(139,92,246,0.2)` : `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: i === 0 ? PURPLE : MUTED, width: 20, flexShrink: 0, paddingTop: 1 }}>#{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#f0f6fc", lineHeight: 1.4, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{ep.title}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{ep.published_at ? new Date(ep.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 600, color: i === 0 ? PURPLE : GREEN, flexShrink: 0 }}>
                    {ep.downloads_total?.toLocaleString() || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 32px", display: "flex", justifyContent: "space-between", fontFamily: "'DM Mono', monospace", fontSize: 10, color: MUTED, marginTop: 24 }}>
        <span>Elite Partners Group · Podcast Dashboard · Advisor Talk with Frank LaRosa</span>
        <span>Source: Simplecast API · Live Data</span>
        <span>Refreshes on every page load</span>
      </div>
    </div>
  );
}
