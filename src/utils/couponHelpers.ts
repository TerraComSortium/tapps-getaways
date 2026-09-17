import type { DiscountType } from '../types/getaway';

export interface CouponLike {
  discountType?: DiscountType;
  discount?: number | null;
  percent?: number | null;
  amount?: number | null;
}

export const getCouponValue = (coupon?: CouponLike | null): number => {
  if (!coupon) return 0;

  const primary = coupon.discountType === 'amount' ? coupon.discount : coupon.percent;
  const legacy = coupon.discount ?? coupon.amount;
  const value = Number(primary) || Number(legacy) || 0;

  return Number.isFinite(value) ? value : 0;
};

export const getCouponLabel = (coupon?: CouponLike | null): string => {
  if (!coupon) return '';
  const value = getCouponValue(coupon);
  return coupon.discountType === 'amount' ? `$${value} Off` : `${value}% Off`;
};
