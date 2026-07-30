// Rutas de las vistas, centralizadas para cambiarlas en un solo lugar.
export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  GETAWAYS: '/getaways',
  MY_GETAWAYS: '/mygetaways',
  GETAWAY_DETAIL: '/getawaydetail',
  BOOKING: '/booking', // dinámica → /booking/:id
  MY_ORDERS: '/myorders',
  PAYMENT: '/payment', // dinámica → /payment/:orderId
  PAID: '/paid',
  RESERVATIONS: '/reservations',
  CREATE_GETAWAY: '/creategetaway',
  DATA_VIEW: '/data-view',
  TEST_API: '/test-api',
  COUPONS: '/coupons',
  COUPON_NEW: '/coupons/new'
} as const;

// Patrones para las definiciones <Route path> con parámetros.
export const ROUTE_PATTERNS = {
  BOOKING: `${ROUTES.BOOKING}/:id`,
  PAYMENT: `${ROUTES.PAYMENT}/:orderId`,
  GETAWAY_DETAIL: `${ROUTES.GETAWAY_DETAIL}/:id`,
  RESERVATIONS: `${ROUTES.RESERVATIONS}/:id/`,
  COUPON_EDIT: `${ROUTES.COUPONS}/:id/edit`,
} as const;

// Constructores para navegar a rutas con parámetros.
export const bookingPath = (id: string) => `${ROUTES.BOOKING}/${id}`;
export const paymentPath = (orderId: string) => `${ROUTES.PAYMENT}/${orderId}`;
export const getawayDetailPath = (id: string) => `${ROUTES.GETAWAY_DETAIL}/${id}`;
export const reservationsPath = (id: string) => `${ROUTES.RESERVATIONS}/${id}/`;
export const couponEditPath = (id: string) => `${ROUTES.COUPONS}/${id}/edit`;

// id-> getawayId
export const couponNewPath = (getawayId?: string) =>
  getawayId ? `${ROUTES.COUPON_NEW}?getawayId=${getawayId}` : `${ROUTES.COUPON_NEW};    