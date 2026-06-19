import { api } from "../../api/api";

interface ReservationUser {
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

interface LodgingOption {
  option: string;
  price: number;
  occupancy?: string;
}

interface OptionalAddOn {
  addonName: string;
  price: number;
}

interface PaymentDetails {
  Subtotal: string;
  Taxes: string;
  Total: string;
}

export interface Reservation {
  getawayId?: string;
  user: ReservationUser;
  lodgingOption?: LodgingOption;
  optionalAddOns?: OptionalAddOn[];
  paymentDetails: PaymentDetails;
}

export const createPurchase = async (reservation: Reservation) => {
  const response = await api.post("/purchase", { reservation });
  return response.data;
};
