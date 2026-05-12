import { api } from "../../api/api";

export const getClubData = async () => {
  const response = await api.get("/club/data");
  return response.data;
};

export const createAcademy = async (clubId: string, academyData: Record<string, unknown>) => {
  const response = await api.post("/club/academy", { club_ID: clubId, ...academyData });
  return response.data;
};
