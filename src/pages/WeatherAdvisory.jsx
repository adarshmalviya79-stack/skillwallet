import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Search,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Compass,
  RotateCcw
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import { apiClient } from '../api/client';

export default function WeatherAdvisory() {
  const [locationInput, setLocationInput] = useState('Chicago, IL');
  const [currentLocation, setCurrentLocation] = useState('Chicago, IL');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (loc) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.getWeather(loc);
      if (res.success && res.data) {
        setWeatherData(res.data);
        setCurrentLocation(res.data.location);
      } else {
        throw new Error(res.error || 'Failed to retrieve meteorological data');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to live meteorological feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(currentLocation);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!locationInput.trim()) return;
    fetchWeather(locationInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
              <CloudSun className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Site Weather Advisory & Safety Thresholds
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time meteorological monitoring with construction-specific OSHA wind, concrete curing, and roofing advisory alerts.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="City, State, or Country..."
              className="rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-sky-500 focus:outline-none w-48 sm:w-60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 transition-colors shadow-xs"
          >
            Update
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <span className="font-bold">Weather Feed Error: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading && !weatherData && (
        <div className="py-20 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500">Fetching live meteorological telemetry from Open-Meteo API...</p>
        </div>
      )}

      {weatherData && (
        <div className="space-y-6">
          {/* Main Weather Card */}
          <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-900 via-slate-900 to-blue-950 p-6 text-white shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200 backdrop-blur">
                  <Compass className="h-3 w-3" />
                  {weatherData.location}
                </span>
                <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
                  {weatherData.current.weather_description}
                </h3>
                <p className="text-xs text-sky-200/80 mt-1 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Telemetry timestamp: {weatherData.timestamp}
                </p>
              </div>

              {/* Temperature block */}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tighter">
                  {Math.round(weatherData.current.temperature_c)}°C
                </span>
                <span className="text-lg text-sky-300">
                  / {Math.round(weatherData.current.temperature_f)}°F
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-white/10 p-2 text-sky-300">
                  <Wind className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-sky-300">Wind & Gusts</span>
                  <p className="text-xs font-bold">
                    {weatherData.current.wind_speed_kmh} km/h (Gusts: {weatherData.current.wind_gusts_kmh})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-white/10 p-2 text-sky-300">
                  <Droplets className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-sky-300">Precipitation</span>
                  <p className="text-xs font-bold">{weatherData.current.precipitation_mm} mm</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-white/10 p-2 text-sky-300">
                  <Thermometer className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-sky-300">Relative Humidity</span>
                  <p className="text-xs font-bold">{weatherData.current.relative_humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-white/10 p-2 text-sky-300">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase text-sky-300">Site Status</span>
                  <p className="text-xs font-bold truncate max-w-[150px]">{weatherData.overall_site_condition}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Construction Operational Safety Advisories */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-sky-600" />
                <span>Trade Operational Safety Advisories</span>
              </h4>
              <span className="text-xs text-slate-400">Evaluated against OSHA & ACI standards</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weatherData.advisories?.map((adv, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 transition-all text-xs space-y-2 ${
                    adv.status.includes('Hazard')
                      ? 'border-red-200 bg-red-50/60'
                      : adv.status.includes('Caution')
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-emerald-200 bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900">{adv.operation}</h5>
                    <SeverityBadge level={adv.status} size="sm" />
                  </div>

                  <p className="text-slate-600">
                    <strong className="text-slate-800">Condition: </strong>
                    {adv.risk_factor}
                  </p>

                  <div className="rounded-lg bg-white/80 p-2 text-slate-800 border border-slate-200/80">
                    <strong className="text-slate-900">Directive: </strong>
                    {adv.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5-Day Outlook */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span>5-Day Construction Weather Forecast</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {weatherData.daily_forecast?.map((day, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs space-y-1">
                  <span className="font-bold text-slate-800">{day.date}</span>
                  <p className="text-slate-500 text-[11px] truncate">{day.condition}</p>
                  <div className="text-sm font-bold text-slate-900 pt-1">
                    {Math.round(day.max_temp_c)}° / {Math.round(day.min_temp_c)}°C
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Rain: {day.precipitation_sum_mm}mm</span>
                    <br />
                    <span>Wind: {day.max_wind_speed_kmh}km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
