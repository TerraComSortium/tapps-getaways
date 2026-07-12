import { useNavigate } from 'react-router-dom';
import type { Getaway } from '../types/getaway';
import { getawayDetailPath } from '../constants/routes';

export const useGetawayNavigation = () => {
  const navigate = useNavigate();

  const handleViewDetails = (getaway: Getaway) => {
    if (!getaway || !getaway._id) return;
    navigate(getawayDetailPath(getaway._id), { 
      state: { getawayData: getaway } 
    });
  };
  return { handleViewDetails };
}