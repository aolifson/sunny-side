import { useState, useEffect, useCallback, useRef } from "react";

const WEATHER_CODES = {
  0: { label: "Clear Sky", icon: "☀️", optimistic: "Perfect sunshine! The sky is giving you its best today.", bg: "linear-gradient(135deg, #FFB347 0%, #FFCC33 50%, #FFF8DC 100%)" },
  1: { label: "Mainly Clear", icon: "🌤️", optimistic: "Almost entirely clear — just a few artistic clouds for character!", bg: "linear-gradient(135deg, #FFB347 0%, #87CEEB 100%)" },
  2: { label: "Partly Cloudy", icon: "⛅", optimistic: "Natural sun-shade included! Built-in UV protection today.", bg: "linear-gradient(135deg, #87CEEB 0%, #B0C4DE 100%)" },
  3: { label: "Overcast", icon: "☁️", optimistic: "Cozy blanket sky — perfect lighting for photos! No squinting required.", bg: "linear-gradient(135deg, #B0C4DE 0%, #A9B8C9 100%)" },
  45: { label: "Fog", icon: "🌫️", optimistic: "Mystery atmosphere unlocked! The world looks like a movie set.", bg: "linear-gradient(135deg, #C9D6DF 0%, #E2E8F0 100%)" },
  48: { label: "Rime Fog", icon: "🌫️", optimistic: "Nature's glitter! Everything gets a magical frosty sparkle.", bg: "linear-gradient(135deg, #E2E8F0 0%, #F0F4F8 100%)" },
  51: { label: "Light Drizzle", icon: "🌦️", optimistic: "Free mist facial! Your skin will thank you.", bg: "linear-gradient(135deg, #74b9ff 0%, #a29bfe 100%)" },
  53: { label: "Moderate Drizzle", icon: "🌦️", optimistic: "Gentle sky-watering — gardens are cheering right now!", bg: "linear-gradient(135deg, #74b9ff 0%, #6c5ce7 100%)" },
  55: { label: "Dense Drizzle", icon: "🌧️", optimistic: "Maximum cozy-inside energy. Hot cocoa weather activated!", bg: "linear-gradient(135deg, #636e72 0%, #6c5ce7 100%)" },
  61: { label: "Slight Rain", icon: "🌧️", optimistic: "A light rinse for everything! The world will look brand new after.", bg: "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)" },
  63: { label: "Moderate Rain", icon: "🌧️", optimistic: "Puddle-jumping weather! Free car wash included.", bg: "linear-gradient(135deg, #0984e3 0%, #6c5ce7 100%)" },
  65: { label: "Heavy Rain", icon: "🌧️", optimistic: "Maximum nature hydration! Umbrella fashion show opportunity.", bg: "linear-gradient(135deg, #2d3436 0%, #0984e3 100%)" },
  71: { label: "Slight Snow", icon: "❄️", optimistic: "Sugar-dusting from the sky! Everything gets a sparkly makeover.", bg: "linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)" },
  73: { label: "Moderate Snow", icon: "🌨️", optimistic: "Snowperson building conditions: IDEAL. Get out there!", bg: "linear-gradient(135deg, #b2bec3 0%, #636e72 100%)" },
  75: { label: "Heavy Snow", icon: "🌨️", optimistic: "Winter wonderland MAXIMUM! Snow day energy is off the charts.", bg: "linear-gradient(135deg, #636e72 0%, #2d3436 100%)" },
  77: { label: "Snow Grains", icon: "🌨️", optimistic: "Tiny ice confetti! Nature is celebrating something.", bg: "linear-gradient(135deg, #dfe6e9 0%, #74b9ff 100%)" },
  80: { label: "Slight Showers", icon: "🌦️", optimistic: "Quick refresher from the sky — it'll be over before you know it!", bg: "linear-gradient(135deg, #74b9ff 0%, #FFB347 100%)" },
  81: { label: "Moderate Showers", icon: "🌧️", optimistic: "Nature's power wash in action! Rainbows are loading…", bg: "linear-gradient(135deg, #0984e3 0%, #a29bfe 100%)" },
  82: { label: "Violent Showers", icon: "⛈️", optimistic: "Sky is going ALL OUT! Maximum dramatic vibes. Stay cozy inside.", bg: "linear-gradient(135deg, #2d3436 0%, #6c5ce7 100%)" },
  85: { label: "Slight Snow Showers", icon: "🌨️", optimistic: "Quick snow sprinkle! Like the sky is decorating a cake.", bg: "linear-gradient(135deg, #dfe6e9 0%, #74b9ff 100%)" },
  86: { label: "Heavy Snow Showers", icon: "🌨️", optimistic: "Full snow globe mode activated! Absolutely magical out there.", bg: "linear-gradient(135deg, #636e72 0%, #dfe6e9 100%)" },
  95: { label: "Thunderstorm", icon: "⛈️", optimistic: "Free light show! Nature's fireworks display — enjoy from inside.", bg: "linear-gradient(135deg, #2d3436 0%, #e17055 100%)" },
  96: { label: "Thunderstorm + Hail", icon: "⛈️", optimistic: "Ultimate indoor day! Sky is doing its most dramatic performance.", bg: "linear-gradient(135deg, #2d3436 0%, #d63031 100%)" },
  99: { label: "Thunderstorm + Heavy Hail", icon: "⛈️", optimistic: "Nature's percussion concert! Fort-building conditions are PERFECT.", bg: "linear-gradient(135deg, #2d3436 0%, #d63031 100%)" },
};

function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { label: "Unknown", icon: "🌈", optimistic: "The sky is doing something unique today! How exciting.", bg: "linear-gradient(135deg, #a29bfe 0%, #fd79a8 100%)" };
}

function getWeatherType(code) {
  if ([95, 96, 99].includes(code)) return "thunderstorm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([51, 53, 55].includes(code)) return "drizzle";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
  if ([45, 48].includes(code)) return "fog";
  return "rain"; // default fallback
}

function flipPrecipitation(chance, code) {
  const dry = 100 - chance;
  const type = getWeatherType(code);
  const noLabel = `no ${type}`;
  if (dry >= 90) return { text: `${dry}% chance of ${noLabel}`, emoji: "😎", vibe: "legendary" };
  if (dry >= 70) return { text: `${dry}% chance of ${noLabel}`, emoji: "🌈", vibe: "great" };
  if (dry >= 50) return { text: `Still a ${dry}% shot of ${noLabel}!`, emoji: "🤞", vibe: "hopeful" };
  if (dry >= 30) return { text: `${dry}% chance of ${noLabel} — timing is everything!`, emoji: "⏰", vibe: "adventurous" };
  if (dry > 0) return { text: `${dry}% window of ${noLabel} — you got this!`, emoji: "💪", vibe: "determined" };
  return { text: `100% ${type} — but hey, it's gonna be cozy!`, emoji: "🌱", vibe: "embrace" };
}

function getSunnyIcon(chance, code) {
  const dry = 100 - chance;
  if (dry > 0) return "☀️";
  // 0% chance of no weather — show actual icon with optimistic energy
  const info = getWeatherInfo(code);
  return info.icon;
}

function optimisticTemp(temp, unit) {
  const symbol = unit === "fahrenheit" ? "°F" : "°C";
  const hotThreshold = unit === "fahrenheit" ? 85 : 29;
  const warmThreshold = unit === "fahrenheit" ? 70 : 21;
  const coolThreshold = unit === "fahrenheit" ? 55 : 13;
  const coldThreshold = unit === "fahrenheit" ? 35 : 2;

  if (temp >= hotThreshold) return { comment: "Perfect for the pool!", emoji: "🏖️" };
  if (temp >= warmThreshold) return { comment: "Ideal vibes temperature!", emoji: "😊" };
  if (temp >= coolThreshold) return { comment: "Perfect layers weather!", emoji: "🧣" };
  if (temp >= coldThreshold) return { comment: "Crisp & refreshing!", emoji: "❄️" };
  return { comment: "Maximum cozy season!", emoji: "🔥" };
}

function optimisticWind(speed) {
  if (speed < 5) return "Barely a whisper — perfect hair day!";
  if (speed < 15) return "Gentle breeze — nature's AC is on low.";
  if (speed < 25) return "Good kite-flying conditions!";
  if (speed < 40) return "Dramatic scarf-blowing photo opportunity!";
  return "Hold onto your hat — adventure mode!";
}

function optimisticUV(index) {
  if (index <= 2) return { text: "Low UV — no sunscreen stress!", color: "#4CAF50" };
  if (index <= 5) return { text: "Moderate — quick tan potential!", color: "#FFB347" };
  if (index <= 7) return { text: "High — vitamin D is charging fast!", color: "#FF8C00" };
  return { text: "Very high — hat & shade fashion time!", color: "#e17055" };
}

function getDayName(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getFormattedDate(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SunnyParticles() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          borderRadius: "50%",
          background: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
    </div>
  );
}

function HourlyChart({ hourlyData, unit }) {
  if (!hourlyData) return null;
  const symbol = unit === "fahrenheit" ? "°F" : "°C";
  const now = new Date();
  const currentHour = now.getHours();
  
  const next24 = hourlyData.time
    .map((t, i) => ({ time: new Date(t), temp: hourlyData.temperature_2m[i], precip: hourlyData.precipitation_probability[i], code: hourlyData.weather_code[i], index: i }))
    .filter(h => h.time >= new Date(now.getTime() - 3600000))
    .slice(0, 24);

  const maxTemp = Math.max(...next24.map(h => h.temp));
  const minTemp = Math.min(...next24.map(h => h.temp));
  const range = maxTemp - minTemp || 1;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", overflowX: "auto", gap: 0, paddingBottom: 8, scrollbarWidth: "none" }}>
        {next24.map((h, i) => {
          const height = ((h.temp - minTemp) / range) * 50 + 20;
          const hour = h.time.getHours();
          const isNow = i === 0;
          const precip = flipPrecipitation(h.precip, h.code);
          const icon = getSunnyIcon(h.precip, h.code);
          const dry = 100 - h.precip;
          const weatherType = getWeatherType(h.code);
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 56, padding: "4px 2px",
              background: isNow ? "rgba(255,255,255,0.15)" : "transparent",
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 11, opacity: 0.7, fontFamily: "'DM Sans', sans-serif" }}>
                {isNow ? "Now" : `${hour % 12 || 12}${hour < 12 ? "a" : "p"}`}
              </span>
              <span style={{ fontSize: 20, margin: "4px 0" }}>{icon}</span>
              <div style={{
                width: 4, borderRadius: 2,
                height: `${height}px`,
                background: `linear-gradient(to top, #FFB347, #FF6B6B)`,
                margin: "4px 0",
                transition: "height 0.5s ease",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                {Math.round(h.temp)}{symbol}
              </span>
              <span style={{ fontSize: 10, opacity: 0.9, color: dry > 0 ? "#FFD700" : "#74b9ff", fontFamily: "'DM Sans', sans-serif" }}>
                {dry > 0 ? `☀️${dry}%` : `${getWeatherInfo(h.code).icon}${h.precip}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayCard({ day, unit, isExpanded, onToggle, index }) {
  const info = getWeatherInfo(day.code);
  const precip = flipPrecipitation(day.precipChance, day.code);
  const symbol = unit === "fahrenheit" ? "°F" : "°C";
  const tempHigh = optimisticTemp(day.high, unit);
  const wind = optimisticWind(day.windMax);
  const uv = optimisticUV(day.uvMax);
  const icon = getSunnyIcon(day.precipChance, day.code);
  const dry = 100 - day.precipChance;

  return (
    <div
      onClick={onToggle}
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 20,
        padding: "16px 20px",
        cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.12)",
        transition: "all 0.3s ease",
        animation: `slideUp 0.4s ease forwards`,
        animationDelay: `${index * 0.05}s`,
        opacity: 0,
        transform: "translateY(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <span style={{ fontSize: 32 }}>{icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>{getDayName(day.date)}</div>
            <div style={{ fontSize: 12, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>{getFormattedDate(day.date)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, opacity: 0.6, fontFamily: "'DM Sans', sans-serif" }}>{Math.round(day.low)}{symbol}</span>
          <div style={{
            width: 60, height: 4, borderRadius: 2, position: "relative",
            background: "rgba(255,255,255,0.15)",
          }}>
            <div style={{
              position: "absolute", height: "100%", borderRadius: 2,
              background: "linear-gradient(to right, #74b9ff, #FFB347, #FF6B6B)",
              left: `${((day.low - day.low) / ((day.high - day.low) || 1)) * 100}%`,
              right: 0,
            }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{Math.round(day.high)}{symbol}</span>
        </div>
        <span style={{
          marginLeft: 8, fontSize: 12, transition: "transform 0.3s",
          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
        }}>▼</span>
      </div>

      {isExpanded && (
        <div style={{
          marginTop: 16, paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.1)",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            fontSize: 14, lineHeight: 1.5, marginBottom: 16,
            fontFamily: "'Merriweather', serif", fontStyle: "italic",
            opacity: 0.85,
          }}>
            "{info.optimistic}"
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>☀️ SUNNY ODDS</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{precip.emoji} {precip.text}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>WIND VIBES</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>💨 {wind}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>UV OUTLOOK</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                <span style={{ color: uv.color }}>●</span> {uv.text}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>TEMP VIBE</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{tempHigh.emoji} {tempHigh.comment}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SunnySideApp() {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [unit, setUnit] = useState("fahrenheit");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState("today");
  const [showSearch, setShowSearch] = useState(false);

  const fetchWeather = useCallback(async (lat, lon, name) => {
    setLoading(true);
    setError(null);
    try {
      const tempUnit = unit === "fahrenheit" ? "fahrenheit" : "celsius";
      const windUnit = unit === "fahrenheit" ? "mph" : "kmh";
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&hourly=temperature_2m,precipitation_probability,weather_code&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto&forecast_days=10`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Weather data unavailable");
      const data = await res.json();

      const days = data.daily.time.map((date, i) => ({
        date,
        code: data.daily.weather_code[i],
        high: data.daily.temperature_2m_max[i],
        low: data.daily.temperature_2m_min[i],
        precipChance: data.daily.precipitation_probability_max[i],
        windMax: data.daily.wind_speed_10m_max[i],
        uvMax: data.daily.uv_index_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      }));

      setWeather(days);
      setHourly(data.hourly);
      setLocation({ lat, lon });
      setLocationName(name);
    } catch (e) {
      setError("Couldn't fetch the weather — but we're sure it's beautiful out there! " + e.message);
    }
    setLoading(false);
  }, [unit]);

  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const r = data.results[0];
        const name = `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country : ""}`;
        await fetchWeather(r.latitude, r.longitude, name);
        setShowSearch(false);
        setSearchQuery("");
      } else {
        setError("Location not found — try another search!");
      }
    } catch {
      setError("Search hiccup! Try again.");
    }
    setSearching(false);
  }, [fetchWeather]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=&count=1&language=en`);
            fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
          } catch {
            fetchWeather(pos.coords.latitude, pos.coords.longitude, "Your Location");
          }
        },
        () => {
          fetchWeather(40.7128, -74.006, "New York, NY");
        }
      );
    } else {
      fetchWeather(40.7128, -74.006, "New York, NY");
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather(location.lat, location.lon, locationName);
    }
  }, [unit]);

  const today = weather?.[0];
  const todayInfo = today ? getWeatherInfo(today.code) : null;
  const todayPrecip = today ? flipPrecipitation(today.precipChance, today.code) : null;
  const todayIcon = today ? getSunnyIcon(today.precipChance, today.code) : "☀️";
  const todayDry = today ? 100 - today.precipChance : 100;
  const symbol = unit === "fahrenheit" ? "°F" : "°C";

  const currentBg = todayInfo?.bg || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

  return (
    <div style={{
      minHeight: "100vh",
      background: currentBg,
      color: "white",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      transition: "background 0.8s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Merriweather:ital@1&family=Playfair+Display:wght@700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        ::-webkit-scrollbar { display: none; }
        
        input::placeholder { color: rgba(255,255,255,0.4); }
        
        .tab-btn {
          padding: 8px 20px;
          border-radius: 20px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'DM Sans', sans-serif;
        }
        
        .glass-card {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          padding: 20px;
        }
      `}</style>

      <SunnyParticles />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "0 16px 32px" }}>
        
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 0 12px", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 3, opacity: 0.6,
              textTransform: "uppercase",
            }}>☀️ Sunny Side</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setUnit(u => u === "fahrenheit" ? "celsius" : "fahrenheit")}
              style={{
                background: "rgba(255,255,255,0.12)", border: "none", color: "white",
                borderRadius: 12, padding: "6px 12px", cursor: "pointer", fontSize: 12,
                fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              °{unit === "fahrenheit" ? "F" : "C"}
            </button>
            <button
              onClick={() => setShowSearch(s => !s)}
              style={{
                background: "rgba(255,255,255,0.12)", border: "none", color: "white",
                borderRadius: 12, width: 36, height: 36, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              🔍
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div style={{ marginBottom: 16, animation: "slideDown 0.3s ease" }}>
            <div style={{
              display: "flex", gap: 8, background: "rgba(255,255,255,0.1)",
              borderRadius: 16, padding: 4, border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchLocation(searchQuery)}
                placeholder="Search any city..."
                style={{
                  flex: 1, background: "transparent", border: "none", color: "white",
                  padding: "10px 14px", fontSize: 15, outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button
                onClick={() => searchLocation(searchQuery)}
                disabled={searching}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none", color: "white",
                  borderRadius: 12, padding: "8px 16px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                }}
              >
                {searching ? "..." : "Go"}
              </button>
            </div>
          </div>
        )}

        {/* Location */}
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.9 }}>📍 {locationName}</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, animation: "spin 2s linear infinite", display: "inline-block" }}>☀️</div>
            <div style={{ marginTop: 16, fontSize: 15, opacity: 0.7 }}>Finding the bright side...</div>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌈</div>
            <div style={{ fontSize: 15, opacity: 0.8 }}>{error}</div>
          </div>
        ) : today && (
          <>
            {/* Today Hero */}
            <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
              <div style={{ fontSize: 72, marginBottom: 8, animation: "pulse 3s ease-in-out infinite" }}>
                {todayIcon}
              </div>
              <div style={{
                fontSize: 64, fontWeight: 800, lineHeight: 1,
                fontFamily: "'Playfair Display', serif",
              }}>
                {Math.round(today.high)}{symbol}
              </div>
              <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>
                Low: {Math.round(today.low)}{symbol}
              </div>
              <div style={{
                fontSize: 16, marginTop: 16, lineHeight: 1.6,
                fontFamily: "'Merriweather', serif", fontStyle: "italic",
                maxWidth: 320, margin: "16px auto 0", opacity: 0.9,
              }}>
                "{todayInfo.optimistic}"
              </div>
              <div style={{
                display: "inline-block", marginTop: 16,
                background: "rgba(255,255,255,0.12)", borderRadius: 20,
                padding: "8px 18px", fontSize: 14, fontWeight: 500,
              }}>
                {todayPrecip.emoji} {todayPrecip.text}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 6, justifyContent: "center", marginBottom: 20,
              background: "rgba(0,0,0,0.15)", borderRadius: 24, padding: 4,
            }}>
              {["today", "hourly", "10-day"].map(t => (
                <button
                  key={t}
                  className="tab-btn"
                  onClick={() => setTab(t)}
                  style={{
                    background: tab === t ? "rgba(255,255,255,0.2)" : "transparent",
                    color: "white",
                    opacity: tab === t ? 1 : 0.6,
                  }}
                >
                  {t === "today" ? "Today" : t === "hourly" ? "Hourly" : "10-Day"}
                </button>
              ))}
            </div>

            {/* Today Tab */}
            {tab === "today" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="glass-card">
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>
                    TODAY'S OPTIMISTIC OUTLOOK
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>☀️ SUNNY ODDS</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{todayDry}%</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {todayDry > 0 ? `chance of no ${getWeatherType(today.code)}` : `${getWeatherType(today.code)} day — cozy up!`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>WIND VIBES</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(today.windMax)}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{unit === "fahrenheit" ? "mph" : "km/h"} — {optimisticWind(today.windMax).split("—")[0]}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>UV ENERGY</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(today.uvMax)}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{optimisticUV(today.uvMax).text}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}>SUNRISE</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {new Date(today.sunrise).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>🌅 New day energy!</div>
                    </div>
                  </div>
                </div>

                {/* Mini Hourly Preview */}
                <div className="glass-card">
                  <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>
                    NEXT FEW HOURS
                  </div>
                  <HourlyChart hourlyData={hourly} unit={unit} />
                </div>

                {/* Affirmation */}
                <div className="glass-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>
                    {todayDry > 0 ? "☀️✨" : `${todayInfo.icon}→🌈`}
                  </div>
                  <div style={{ fontFamily: "'Merriweather', serif", fontStyle: "italic", fontSize: 14, lineHeight: 1.6 }}>
                    {todayDry === 0
                      ? `Full ${getWeatherType(today.code)} day — but every ${getWeatherType(today.code) === "snow" ? "snowflake" : "drop"} brings us closer to sunshine! Cozy vibes win today.`
                      : todayDry >= 70
                        ? "The universe has basically cleared the sky for you today. Make it count!"
                        : `${todayDry}% chance of no ${getWeatherType(today.code)} — the sun is fighting for you!`}
                  </div>
                </div>
              </div>
            )}

            {/* Hourly Tab */}
            {tab === "hourly" && (
              <div className="glass-card">
                <div style={{ fontSize: 11, opacity: 0.5, marginBottom: 8, fontWeight: 700, letterSpacing: 1 }}>
                  24-HOUR BRIGHT OUTLOOK
                </div>
                <HourlyChart hourlyData={hourly} unit={unit} />
              </div>
            )}

            {/* 10-Day Tab */}
            {tab === "10-day" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  fontSize: 11, opacity: 0.5, fontWeight: 700, letterSpacing: 1,
                  padding: "0 4px", marginBottom: 4,
                }}>
                  10-DAY OPTIMISTIC FORECAST
                </div>
                {weather.map((day, i) => (
                  <DayCard
                    key={day.date}
                    day={day}
                    unit={unit}
                    index={i}
                    isExpanded={expandedDay === i}
                    onToggle={() => setExpandedDay(expandedDay === i ? null : i)}
                  />
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{
              textAlign: "center", marginTop: 32, padding: "16px 0",
              fontSize: 11, opacity: 0.4,
            }}>
              Powered by Open-Meteo · Always looking on the bright side ☀️
            </div>
          </>
        )}
      </div>
    </div>
  );
}
