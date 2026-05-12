import type { Getaway } from '../types/getaway';

export const sportMap: { [key: string]: string } = {
  '1': 'Tennis',
  '2': 'Padel',
  '3': 'Pickleball',
  '4': 'Other'
};

export const getSportLabel = (sportKey: string): string => {
  if (!sportKey) return 'Not available';
  return sportMap[sportKey] || sportKey || 'Not available';
};

export const normalizeGetawayData = (raw: any): Getaway => ({
  _id: raw._id || raw.id || `temp_${Math.random()}`,
  title: raw.title || raw.getawayTitle || "Untitled Offer",
  overview: raw.overview || raw.getawayOverview || "",
  startDate: raw.startDate || "",
  endDate: raw.endDate || "",
  sport: raw.sport || "",
  galleryPhotos: raw.galleryPhotos || raw.galleryPhoto || [],
  lodgingOptions: raw.lodgingOptions || [],
  optionalAddOns: raw.optionalAddOns || [],
  amenities: raw.amenities || [],
  schedule: raw.schedule || [],
  caption: raw.caption || "",
  galleryVideo: raw.galleryVideo || "",
  mainDescription: raw.mainDescription || raw.getawayOverview || "",
  policies: raw.policies || "",
  terms: raw.terms || "",
  getawayAddress: raw.getawayAddress || {
    address: raw.address || "",
    lat: raw.location?.lat || 0,
    lng: raw.location?.lng || 0,
  },
});

export const performFallbackLocalSearch = (
  rawData: any[],
  filters: { q?: string; sport?: string; startDate?: string | null; endDate?: string | null }
): Getaway[] => {
  let results = rawData.map(normalizeGetawayData);

  if (filters.q?.trim()) {
    const term = filters.q.trim().toLowerCase();
    results = results.filter(g =>
      g.getawayAddress?.address.toLowerCase().includes(term) ||
      g.title.toLowerCase().includes(term)
    );
  }

  if (filters.sport?.trim()) {
    const label = getSportLabel(filters.sport).toLowerCase();
    results = results.filter(g => getSportLabel(g.sport).toLowerCase() === label);
  }

  if (filters.startDate?.trim()) {
    results = results.filter(g => !g.startDate || g.startDate >= filters.startDate!);
  }

  if (filters.endDate?.trim()) {
    results = results.filter(g => !g.endDate || g.endDate <= filters.endDate!);
  }

  return results;
};

export const getValidImages = (photos: string[] | undefined): string[] => {
  if (!photos || !Array.isArray(photos) || photos.length === 0) return [];
  return photos.filter(url => url && typeof url === 'string' && url.length > 5);
};
