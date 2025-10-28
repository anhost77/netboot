import { useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export function usePageTitle(pageTitle?: string) {
  const { settings } = useSettings();

  useEffect(() => {
    const siteName = settings?.siteName || 'BetTracker';
    const title = pageTitle ? `${pageTitle} - ${siteName}` : siteName;
    document.title = title;
  }, [settings, pageTitle]);
}
