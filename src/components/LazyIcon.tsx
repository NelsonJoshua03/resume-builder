import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Define icon name type
type IconName = 
  | 'Mail'
  | 'Calendar'
  | 'MapPin'
  | 'Briefcase'
  | 'GraduationCap'
  | 'DollarSign'
  | 'Clock'
  | 'ChevronRight'
  | 'ExternalLink'
  | 'Filter'
  | 'Search'
  | 'X'
  | 'Home'
  | 'User'
  | 'Settings'
  | 'LogOut'
  | 'Edit'
  | 'Trash2'
  | 'Plus'
  | 'Minus'
  | 'Check'
  | 'AlertCircle'
  | 'Info'
  | 'Download'
  | 'Upload'
  | 'Eye'
  | 'EyeOff'
  | 'Lock'
  | 'Unlock'
  | 'Menu'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'Share2'
  | 'Heart'
  | 'Star'
  | 'ThumbsUp'
  | 'MessageCircle'
  | 'Phone'
  | 'Globe'
  | 'Facebook'
  | 'Twitter'
  | 'Linkedin'
  | 'Instagram'
  | 'Youtube'
  | 'Github'
  | 'Code'
  | 'Database'
  | 'Server'
  | 'Cpu'
  | 'Smartphone'
  | 'Monitor'
  | 'Wifi'
  | 'Cloud'
  | 'Zap'
  | 'Sun'
  | 'Moon'
  | string;

// Icon map with dynamic imports
const iconComponents: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  Mail: () => import('lucide-react').then(mod => ({ default: mod.Mail })),
  Calendar: () => import('lucide-react').then(mod => ({ default: mod.Calendar })),
  MapPin: () => import('lucide-react').then(mod => ({ default: mod.MapPin })),
  Briefcase: () => import('lucide-react').then(mod => ({ default: mod.Briefcase })),
  GraduationCap: () => import('lucide-react').then(mod => ({ default: mod.GraduationCap })),
  DollarSign: () => import('lucide-react').then(mod => ({ default: mod.DollarSign })),
  Clock: () => import('lucide-react').then(mod => ({ default: mod.Clock })),
  ChevronRight: () => import('lucide-react').then(mod => ({ default: mod.ChevronRight })),
  ExternalLink: () => import('lucide-react').then(mod => ({ default: mod.ExternalLink })),
  Filter: () => import('lucide-react').then(mod => ({ default: mod.Filter })),
  Search: () => import('lucide-react').then(mod => ({ default: mod.Search })),
  X: () => import('lucide-react').then(mod => ({ default: mod.X })),
  Home: () => import('lucide-react').then(mod => ({ default: mod.Home })),
  User: () => import('lucide-react').then(mod => ({ default: mod.User })),
  Settings: () => import('lucide-react').then(mod => ({ default: mod.Settings })),
  LogOut: () => import('lucide-react').then(mod => ({ default: mod.LogOut })),
  Edit: () => import('lucide-react').then(mod => ({ default: mod.Edit })),
  Trash2: () => import('lucide-react').then(mod => ({ default: mod.Trash2 })),
  Plus: () => import('lucide-react').then(mod => ({ default: mod.Plus })),
  Minus: () => import('lucide-react').then(mod => ({ default: mod.Minus })),
  Check: () => import('lucide-react').then(mod => ({ default: mod.Check })),
  AlertCircle: () => import('lucide-react').then(mod => ({ default: mod.AlertCircle })),
  Info: () => import('lucide-react').then(mod => ({ default: mod.Info })),
  Download: () => import('lucide-react').then(mod => ({ default: mod.Download })),
  Upload: () => import('lucide-react').then(mod => ({ default: mod.Upload })),
  Eye: () => import('lucide-react').then(mod => ({ default: mod.Eye })),
  EyeOff: () => import('lucide-react').then(mod => ({ default: mod.EyeOff })),
  Lock: () => import('lucide-react').then(mod => ({ default: mod.Lock })),
  Unlock: () => import('lucide-react').then(mod => ({ default: mod.Unlock })),
  Menu: () => import('lucide-react').then(mod => ({ default: mod.Menu })),
  ArrowLeft: () => import('lucide-react').then(mod => ({ default: mod.ArrowLeft })),
  ArrowRight: () => import('lucide-react').then(mod => ({ default: mod.ArrowRight })),
  ArrowUp: () => import('lucide-react').then(mod => ({ default: mod.ArrowUp })),
  ArrowDown: () => import('lucide-react').then(mod => ({ default: mod.ArrowDown })),
  Share2: () => import('lucide-react').then(mod => ({ default: mod.Share2 })),
  Heart: () => import('lucide-react').then(mod => ({ default: mod.Heart })),
  Star: () => import('lucide-react').then(mod => ({ default: mod.Star })),
  ThumbsUp: () => import('lucide-react').then(mod => ({ default: mod.ThumbsUp })),
  MessageCircle: () => import('lucide-react').then(mod => ({ default: mod.MessageCircle })),
  Phone: () => import('lucide-react').then(mod => ({ default: mod.Phone })),
  Globe: () => import('lucide-react').then(mod => ({ default: mod.Globe })),
  Facebook: () => import('lucide-react').then(mod => ({ default: mod.Facebook })),
  Twitter: () => import('lucide-react').then(mod => ({ default: mod.Twitter })),
  Linkedin: () => import('lucide-react').then(mod => ({ default: mod.Linkedin })),
  Instagram: () => import('lucide-react').then(mod => ({ default: mod.Instagram })),
  Youtube: () => import('lucide-react').then(mod => ({ default: mod.Youtube })),
  Github: () => import('lucide-react').then(mod => ({ default: mod.Github })),
  Code: () => import('lucide-react').then(mod => ({ default: mod.Code })),
  Database: () => import('lucide-react').then(mod => ({ default: mod.Database })),
  Server: () => import('lucide-react').then(mod => ({ default: mod.Server })),
  Cpu: () => import('lucide-react').then(mod => ({ default: mod.Cpu })),
  Smartphone: () => import('lucide-react').then(mod => ({ default: mod.Smartphone })),
  Monitor: () => import('lucide-react').then(mod => ({ default: mod.Monitor })),
  Wifi: () => import('lucide-react').then(mod => ({ default: mod.Wifi })),
  Cloud: () => import('lucide-react').then(mod => ({ default: mod.Cloud })),
  Zap: () => import('lucide-react').then(mod => ({ default: mod.Zap })),
  Sun: () => import('lucide-react').then(mod => ({ default: mod.Sun })),
  Moon: () => import('lucide-react').then(mod => ({ default: mod.Moon })),
};

// Fallback component for missing icons
const FallbackIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <div 
    style={{ 
      width: size, 
      height: size,
      borderRadius: '4px',
      background: '#e5e7eb'
    }} 
    className={className}
  />
);

interface LazyIconProps {
  name: IconName;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  fallback?: React.ReactNode;
}

const LazyIcon: React.FC<LazyIconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  color,
  strokeWidth,
  fallback 
}) => {
  const iconLoader = iconComponents[name];
  
  if (!iconLoader) {
    console.warn(`Icon "${name}" not found in LazyIcon map`);
    return <FallbackIcon size={size} className={className} />;
  }
  
  const LazyComponent = lazy(() => iconLoader().catch(() => ({
    default: () => fallback || <FallbackIcon size={size} className={className} />
  })));
  
  return (
    <Suspense fallback={fallback || <FallbackIcon size={size} className={className} />}>
      <LazyComponent 
        size={size} 
        className={className} 
        color={color}
        strokeWidth={strokeWidth}
      />
    </Suspense>
  );
};

// Preload critical icons (for above-the-fold content)
export const preloadIcons = (iconNames: IconName[]) => {
  iconNames.forEach(name => {
    const loader = iconComponents[name];
    if (loader) {
      loader().catch(() => {});
    }
  });
};

// Preload common icons immediately
if (typeof window !== 'undefined') {
  // Preload critical icons after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloadIcons(['Home', 'Search', 'Menu', 'User', 'Briefcase']);
    }, 1000);
  });
}

export default LazyIcon;