import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
  Snowflake,
} from 'lucide-react';
import { WeatherIconCode } from '@/lib/weather/types/weather';

interface WeatherIconProps {
  code: WeatherIconCode;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = '', size = 32 }) => {
  switch (code) {
    case 'clear_day':
      return <Sun size={size} className={`text-amber-400 animate-spin-slow ${className}`} color="#f59e0b" />;
    case 'clear_night':
      return <Moon size={size} className={`text-indigo-300 ${className}`} color="#a5b4fc" />;
    case 'partly_cloudy_day':
      return <CloudSun size={size} className={`text-amber-300 ${className}`} color="#fbbf24" />;
    case 'partly_cloudy_night':
      return <CloudMoon size={size} className={`text-indigo-200 ${className}`} color="#c7d2fe" />;
    case 'cloudy':
      return <Cloud size={size} className={`text-slate-300 ${className}`} color="#94a3b8" />;
    case 'overcast':
      return <Cloud size={size} className={`text-slate-400 ${className}`} color="#64748b" />;
    case 'fog':
      return <CloudFog size={size} className={`text-slate-400 ${className}`} color="#94a3b8" />;
    case 'drizzle':
      return <CloudDrizzle size={size} className={`text-sky-400 ${className}`} color="#38bdf8" />;
    case 'rain':
      return <CloudRain size={size} className={`text-blue-400 ${className}`} color="#60a5fa" />;
    case 'heavy_rain':
      return <CloudRain size={size} className={`text-blue-500 font-bold ${className}`} color="#3b82f6" />;
    case 'sleet':
      return <CloudSnow size={size} className={`text-teal-300 ${className}`} color="#5eead4" />;
    case 'snow':
      return <CloudSnow size={size} className={`text-cyan-200 ${className}`} color="#a5f3fc" />;
    case 'heavy_snow':
      return <Snowflake size={size} className={`text-cyan-100 animate-pulse ${className}`} color="#e0f2fe" />;
    case 'thunderstorm':
      return <CloudLightning size={size} className={`text-purple-400 animate-bounce-subtle ${className}`} color="#c084fc" />;
    case 'thunderstorm_rain':
      return <CloudLightning size={size} className={`text-purple-500 ${className}`} color="#a855f7" />;
    default:
      return <CloudSun size={size} className={`text-amber-300 ${className}`} color="#fbbf24" />;
  }
};
