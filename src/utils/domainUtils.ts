// src/utils/domainUtils.ts
export const getCurrentDomain = (): string => {
  return window.location.hostname;
};

export const isWwwDomain = (): boolean => {
  return window.location.hostname.startsWith('www.');
};

export const getCanonicalDomain = (): string => {
  const domain = window.location.hostname;
  // Remove www. prefix for canonical URLs
  return domain.replace(/^www\./, '');
};

export const shouldTrackForDomain = (domainType: 'both' | 'non-www' | 'www' = 'both'): boolean => {
  const isWww = isWwwDomain();
  
  switch (domainType) {
    case 'both':
      return true;
    case 'non-www':
      return !isWww;
    case 'www':
      return isWww;
    default:
      return true;
  }
};