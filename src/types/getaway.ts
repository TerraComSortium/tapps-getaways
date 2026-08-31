export interface LocationEntry {
  address: string;
  lat: number | null;
  lng: number | null;
}

export type ScheduleRow = {
  id?: string;
  date: string;
  startHour: string; // 1 to 12
  startMinute: string; // 00,15,30,45
  startPeriod: string; // AM/PM
  endHour: string;
  endMinute: string;
  endPeriod: string;
  activity: string;
  location: string;
};

export interface ApiScheduleEntry {
  date: string;
  startTime: string;
  endTime: string;
  activity: string;
  location: string;
}

export interface GetawayBase {
  title: string;
  overview: string;
  startDate: string;
  endDate: string;
  sport: string;
  // price: number;
  getawayAddress: LocationEntry;
  caption?: string;
  galleryVideo: string;
  mainDescription: string;
  lodgingOptions: { name: string, price: number }[];
  optionalAddOns: { name: string, price: number }[];
  amenities: { name: string }[];
  schedule: ApiScheduleEntry[];
  discounts?: Discount[];
  policies: string;
  terms: string;
}

export interface GalleryPhotoEntry {
  file: File | null;
  caption?: string;
}
export interface GetawayFormData extends GetawayBase {
  galleryPhotos: GalleryPhotoEntry[];
}
export interface Getaway extends GetawayBase{
  _id: string;
  galleryPhotos: string[];
  galleryPhotoCaptions?: string[];
}

export type GetawayPayload = Omit<GetawayFormData, 'galleryPhotos' | 'optionalAddOns' | 'discounts' | 'getawayAddress'> & {
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  optionalAddOns: { name: string; price: number }[];
  galleryPhotos: File[];
  galleryPhotoCaptions?: string[];
}

export interface Discount {
  id: string;
  title: string;
  description?: string;
  discount: number;
  ownerId: string;
  userLimit: number;
  usersUsed: string[];
  validFrom: { _seconds: number; _nanoseconds: number } | null;
  validUntil: { _seconds: number; _nanoseconds: number } | null;
  createdAt: { _seconds: number; _nanoseconds: number };
  updatedAt: { _seconds: number; _nanoseconds: number };
  // isActive: boolean;
}
// to POST -> API
export interface CouponPayload {
  validFrom: string;    // ISO date
  validUntil: string;   // ISO date
  userLimit?: number;
  title: string;
  description?: string;
  discount: number;
  discountType: DiscountType;
  getawayId?: string;
}
export type DiscountType = 'amount' | 'percentage';
