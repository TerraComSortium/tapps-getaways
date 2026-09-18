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
  tournamentIds?: string[];
  ladderIds?: string[];
  academyIds?: string[];
  /** Documentos completos que el backend adjunta a partir de los ids de arriba. */
  academyClasses?: unknown[];
  tournaments?: unknown[];
  ladders?: unknown[];
  /** Datos públicos del dueño, resueltos por el backend desde `ownerId`. */
  owner?: GetawayOwner | null;
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
  tournamentIds?: string[];
  ladderIds?: string[];
  academyIds?: string[];
}

export interface Discount {
  id: string;
  title: string;
  description?: string;
  discount: number;
  percent?: number;
  amount?: number;
  discountType?: DiscountType;
  ownerId: string;
  getawayId?: string;
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

// ─── Órdenes de un getaway (colección `getaways_orders`) ───
export interface OrderUser {
  id: string;
  name: string;
  email: string;
  cellphone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface OrderLodgingOption {
  option: string;
  price: number;
  occupancy?: string | null;
}

export interface OrderAddOn {
  addonName: string;
  price: number;
}

export interface OrderPaymentDetails {
  Subtotal: string;
  Taxes: string;
  Total: string;
}

export interface OrderReservation {
  getawayId: string;
  couponId?: string;
  user: OrderUser;
  lodgingOption?: OrderLodgingOption;
  optionalAddOns?: OrderAddOn[];
  paymentDetails: OrderPaymentDetails;
}

/**
 * Una orden tal como la devuelve `GET /getaways/:id/subscribers`.
 * `status` nace en 'pending' (createPurchase) y pasa a 'paid' al confirmarse el
 * cobro; los campos de pago solo existen a partir de ese momento.
 */
export interface GetawayOrder {
  id: string;
  orderId: string;
  createdAt: string;
  status: 'pending' | 'paid' | string;
  reservation: OrderReservation;
  paymentStatus?: string;
  paymentIntentId?: string;
  invoiceNumber?: string;
  paidAt?: string;
}

/** Datos públicos del RCNET que publica el getaway (`getOffer` los adjunta). */
export interface GetawayOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  clubId?: string | null;
  clubName?: string;
}
