import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress, Chip } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddIcon from '@mui/icons-material/Add';

// import Badge, { badgeClasses } from '@mui/material/Badge';
// import { styled } from '@mui/material/styles';

import { BRAND } from '../theme/colors';
import prevPhoto from '../assets/backgrounds/hotel.jpg';
import '../App.css';
// import {Skeleton} from '@mui/material';
// import { useAuthRole } from '../hooks/useAuthRole';
// import { useAuth } from '../contexts/AuthContext';

// const CartBadge = styled(Badge)`
//   & .${badgeClasses.badge} {
//     top: -4px;
//     right: -76px;
//     background-color: ${BRAND.green};
//     color: ${BRAND.white};
//     border: 1px solid ${BRAND.white};
//   }
// `;
const isPhotoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoRegex = /youtube\.com|youtu\.be|vimeo\.com/;
  return !videoRegex.test(url);
};
interface GetawayItemProps {
  name: string;
  dates: string;
  lodgingOptions: { name: string, price: number }[];
  sport: string;
  galleryPhotos: string[];
  bookedDate?: string;
  isLoading?: boolean;
  onViewDetails?: () => void;
  onBookNow?: () => void;
  onOrderDetails?: () => void;
  onViewBookings?: () => void;
  // badgeCount?: number;
  onEdit?: () => void;
  onAddCoupon?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const GetawayItem = memo(
  ({
    name, dates, lodgingOptions, sport, galleryPhotos, bookedDate, isLoading = false, onViewDetails, onBookNow, onOrderDetails, onViewBookings,
    // badgeCount = 0,
    onAddCoupon, onEdit,
    onDelete,
    isDeleting
  }: GetawayItemProps ) =>
  {
    const { t } = useTranslation();
    // const { role, isLoading } = useAuth();
    // console.log("Estado de carga:", isLoading, "Rol recibido:", role);

    // const editGetaway = () => {
    //   navigate('/creategetaway');
    // };

    //previewImg Check
    const getDisplayImage = (): string => {
      if (galleryPhotos && galleryPhotos.length > 0) {
        const firstPhoto = galleryPhotos[0];
        // img validation
        if (isPhotoUrl(firstPhoto)) {
          return firstPhoto;
        }
      }
      return prevPhoto; //default img
    };
    const imageUrl = getDisplayImage();

    // if(isLoading){ return null; }
    if(isLoading){
      return(
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      );
      //(<Skeleton variant="rectangular" width={300} height={400} sx={{borderRadius:'15px'}}/>);
    }

    return(
      <>
        <Card elevation={0} sx={{ display: "flex", mb:2, borderRadius: "10px", backgroundColor: BRAND.bgPaper, boxShadow: "0 2px 8px 0 #c1c9d7, 0 -2px 8px 0 #cce1e9"}}>
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }} >
            <Box>
              {/* { onViewDetails && ( */}
              <Typography
                onClick={onViewDetails}
                sx={{ fontSize: '16px', color:BRAND.primary, fontWeight: '600', cursor: onViewDetails ? 'pointer': 'default'}}
                // style={{ cursor: 'pointer' }}
              > {name} </Typography>
              {/* )} */}
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal'}}>
                {t('getawayItem.by')}
                {/* {rcnet.name ||  */}
                {` ${t('getawayItem.nameUnavailable')}`}
                {/* } */}
              </Typography>

              <Chip
                label={sport}
                icon={ <SportsTennisIcon sx={{ p:'0 2px' }} /> }
                sx={{ padding:'0 0.5rem', m:'3px 0' }}
              ></Chip>

              <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal'}}>
                {t('getawayItem.dates')}: {dates}
              </Typography>

              {bookedDate && (
                <Chip
                  label={`${t('getawayItem.booked')}: ${bookedDate}`}
                  size="small"
                  sx={{ width: 'fit-content', m: '3px 0', bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                />
              )}

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb:1 }}>
                <Box >
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal', alignItems: 'center' }}>
                    {t('getawayItem.pricingStartsAt')}
                  </Typography>
                  {/* enlist array */}
                  {lodgingOptions && lodgingOptions.length > 0 ? (
                    lodgingOptions.map((option, index) => (
                      <Typography key={index} variant="body2" sx={{ color: 'text.primary' }}>
                        {option.name} ${option.price}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>{t('getawayItem.unavailablePricing')}</Typography>
                  )}
                </Box>
              </Box>
            </Box>
            {/* <Box component="p" sx={{ fontSize: 14, color: "black", m: '10px 0'}}> {description} </Box> */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              { onBookNow && (
                <Button disableElevation startIcon={<ShoppingCartIcon/>}
                  sx={{
                    width: 128,
                    m:'0 0.3rem',
                    borderRadius: '30px',
                    bgcolor:BRAND.primary, color: BRAND.white,
                    fontVariantCaps: 'normal', textTransform: 'none',
                  }}
                  onClick={onBookNow}
                > {t('getawayItem.bookNow')} </Button>
              )}
              {/* {role === 'player' && ( */}
              { onOrderDetails && (
                <Button disableElevation startIcon={<ReceiptIcon/>}
                  sx={{
                    width: 160,
                    m:'0 0.3rem',
                    borderRadius: '30px',
                    bgcolor:BRAND.primary, color: BRAND.white,
                    fontVariantCaps: 'normal', textTransform: 'none',
                  }}
                  onClick={onOrderDetails}
                > {t('getawayItem.orderDetails')} </Button>
              )}
              { onViewBookings && (
                <Button aria-label="view offer's bookings"
                  // onClick={ onViewBookings }
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewBookings?.();
                  }}
                  disableElevation
                  startIcon={
                    // <CartBadge
                      // badgeContent={1}
                      // // badgeContent={badgeCount}
                      // overlap="circular">
                      <RoomServiceIcon />
                    // </CartBadge>
                  }
                  sx={{
                    width: 120,
                    m: '0 0.5rem',
                    borderRadius: '24px',
                    bgcolor: BRAND.primary, color: BRAND.white,
                    fontVariantCaps: 'normal', textTransform: 'none',
                  }}
                > {t('getawayItem.bookings')} </Button>
              )}
              { onAddCoupon && (
                <Button startIcon={<AddIcon />} variant="contained" aria-label="Add discount"  disableElevation
                  onClick={onAddCoupon}
                  sx={{
                    // mt: 2, mb: 3,
                    bgcolor:BRAND.primary, color:  BRAND.white, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                    ':hover': { bgcolor:BRAND.white, color:BRAND.primary }
                  }}
                >
                {t('coupon.addCoupon') || "Add coupon" }
                </Button>
              )}
              { onDelete && (
                <Button startIcon={<DeleteIcon/>} disableElevation
                  onClick={onDelete}
                  disabled={isDeleting}
                  size="medium"
                  sx={{
                    width:104,
                    m:'0 0.3rem',
                    borderRadius: '30px',
                    bgcolor: BRAND.primary, color: BRAND.white,
                    fontVariantCaps:'normal', textTransform: 'none',
                    opacity: isDeleting ? 0.7 : 1,
                    '&:hover': {
                      bgcolor: BRAND.primaryDark
                    }
                  }}
                >
                  {isDeleting ? t('getawayItem.wait') : t('getawayItem.delete')}
                </Button>
              )}
            </Box>
          </CardContent>
          <Box sx={{ width: 300, flexShrink: 0, position: 'relative'}}>
            <CardMedia
              image={imageUrl}
              sx={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                borderRadius: '0 10px 10px 0'
              }}
            />
            <Box sx={{
              display: 'flex', position: 'relative',
              width: '100%', height: '100%',
              justifyContent: 'center', alignItems: 'center'
            }}>
              { onEdit && (
                <Button startIcon={<EditIcon />} onClick={onEdit} disableElevation size="medium"
                  sx={{
                    width:145,
                    color: BRAND.navy, bgcolor: BRAND.green,
                    borderRadius: '30px',
                    fontWeight: 'bold', textTransform: 'none',
                  }}
                > {t('getawayItem.editGetaway')}
                </Button>
              )}
            </Box>
          </Box>
        </Card>
      </>
    )
  }
);