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

export const normalizeGetawayData = (raw: any): Getaway => {
  return {
    ...raw,
    _id: raw._id || raw.id || `temp_${Math.random()}`,
    title: raw.title || raw.getawayTitle || "Untitled Offer",
    overview: raw.overview || raw.getawayOverview || "",
    startDate: parseFirestoreDate(raw.startDate),
    endDate: parseFirestoreDate(raw.endDate),
    sport: raw.sport || "",
    // price: Number(raw.price) || 0,
    galleryPhotos: raw.galleryPhotos || raw.galleryPhoto || [],

    lodgingOptions: raw.lodgingOptions || [],
    optionalAddOns: raw.optionalAddOns || [],
    amenities: raw.amenities || [],
    schedule: raw.schedule?.map((item: any) => ({
      ...item,
      date: parseFirestoreDate(item.date)
    })) || [],
    caption: raw.caption || "",
    galleryVideo: raw.galleryVideo || "",
    mainDescription: raw.mainDescription || raw.getawayOverview || "",
    policies: raw.policies || "",
    terms: raw.terms || "",

    getawayAddress: raw.getawayAddress || { address: raw.address || "", lat: raw.location?.lat || 0, lng: raw.location?.lng || 0 }
  };
};

export const getStartingPrice = (
  lodgingOptions: { name: string; price: number }[]
): number => {
  if (!lodgingOptions?.length) return 0;
  return Math.min(...lodgingOptions.map((o) => o.price));
};

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

export const formatGetawayDates = (start: any, end: any): string => {
  //validation
  const startStr = typeof start === 'string' ? start.trim() : (start instanceof Date ? start.toLocaleDateString() : "");
  const endStr = typeof end === 'string' ? end.trim() : (end instanceof Date ? end.toLocaleDateString() : "");

  if (startStr && endStr) return `${startStr} - ${endStr}`;
  if (startStr) return `Starts: ${startStr}`;
  if (endStr) return `Ends: ${endStr}`;

  return "No dates available";
};

export const parseFirestoreDate = (rawDate: unknown): string => {
  if (!rawDate) return "";
  try {
    //if valid date is string, return
    if (typeof rawDate === 'string') {
      const date = new Date(rawDate);
      return isNaN(date.getTime()) ? "" : formatDate(date);
    }

    //timestamp firestore
    if (typeof rawDate === 'object' && rawDate !== null) {
      const ts = rawDate as Record<string, unknown>;
      const secs = (ts.seconds ?? ts._seconds) as number | undefined;
      if (secs !== undefined) {
        return formatDate(new Date(secs * 1000));
      }
    }
    // Date native
    if (rawDate instanceof Date) {
      return isNaN(rawDate.getTime()) ? "" : formatDate(rawDate);
    }
    return "";
  } catch {
    return "";
  }
}
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}