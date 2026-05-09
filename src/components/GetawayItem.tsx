import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress } from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import prevPhoto from '../assets/backgrounds/hotel.jpg';
import '../App.css';
// import {Skeleton} from '@mui/material';
// import { useAuthRole } from '../hooks/useAuthRole';
import { memo } from 'react';
import { useAuth } from '../contexts/AuthContext'

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
  onViewDetails: () => void;
  onBookNow: () => void;
}

export const GetawayItem = memo(
  ({ name, dates, lodgingOptions, sport, galleryPhotos, onViewDetails, onBookNow }: GetawayItemProps ) =>
    {
      // const { role, isLoading } = useAuthRole();
      const { role, isLoading } = useAuth();
      console.log("Estado de carga:", isLoading, "Rol recibido:", role);
      const navigate = useNavigate();

      const editGetaway = () => {
        navigate('/creategetaway');
      };
      const bookings = () => {
        navigate('/reservations');
      };
      //const toGetaway = () => {
      //  navigate('/getawaydetail');
      //};

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
          <Card elevation={0} sx={{ display: "flex", mb:2, borderRadius: "10px", backgroundColor: '#fff', boxShadow: "0 2px 8px 0 #c1c9d7, 0 -2px 8px 0 #cce1e9"}}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }} >
              <Box>
                <Typography
                  // onClick={toGetaway}
                  onClick={onViewDetails}
                  sx={{ fontSize: '16px', color:'#3C1C91', fontWeight: '600',}}
                  style={{ cursor: 'pointer' }}
                > {name} </Typography>

                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal'}}>
                  By
                  {/* {rcnet.name ||  */}
                  {' Getaway name unavailable'}
                  {/* } */}
                </Typography>

                <Chip
                  label={sport}
                  icon={ <SportsTennisIcon sx={{ p:'0 2px' }} /> }
                  sx={{ padding:'0 0.5rem', m:'3px 0' }}
                ></Chip>

                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal'}}>
                  Dates: {dates}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb:1 }}>
                  <Box >
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal', alignItems: 'center' }}>
                      Pricing Starts at:
                    </Typography>
                    {/* enlist array */}
                    {lodgingOptions && lodgingOptions.length > 0 ? (
                      lodgingOptions.map((option, index) => (
                        <Typography key={index} variant="body2" sx={{ color: 'text.primary' }}>
                          {option.name} ${option.price}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Unavailable pricing</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* <Box component="p" sx={{ fontSize: 14, color: "black", m: '10px 0'}}> {description} </Box> */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {role === 'player' && (
                  <Button disableElevation
                    sx={{
                      width: 120,
                      padding:'0 5', borderRadius: '30px',
                      bgcolor:'#3C1C91', color: '#fff',
                      fontVariantCaps: 'normal', textTransform: 'none',
                    }}
                    onClick={onBookNow}
                  > Book now </Button>
                )}
                {role === 'admin' && (
                  <Button startIcon={<RoomServiceIcon />} onClick={ bookings } disableElevation
                    sx={{
                      width: 122, m: '0 0.5rem',
                      borderRadius: '30px',
                      bgcolor: '#3C1C91', color: '#fff',
                      fontVariantCaps: 'normal', textTransform: 'none',
                    }}
                  > Bookings </Button>
                )}
                {role === 'admin' && (
                  <Button startIcon={<DeleteIcon />} disableElevation
                    // onClick={""}
                    size="medium"
                    sx={{
                      width:104,
                      m:'0 0.3rem',
                      borderRadius: '30px',
                      bgcolor: '#3C1C91', color: '#fff',
                      fontVariantCaps:'normal', textTransform: 'none',
                    }}
                  > Delete </Button>
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
              {role === 'admin' && (
                <Button startIcon={<EditIcon />} onClick={editGetaway} disableElevation size="medium"
                  sx={{
                    width:145,
                    // padding: '8px 20px',
                    // m:'0 0.3rem',
                    color: '#1A2660', bgcolor: '#00E392',
                    borderRadius: '30px',
                    fontWeight: 'bold', textTransform: 'none',
                  }}
                > Edit getaway
                </Button>
              )}
              </Box>
          </Box>
        </Card>
        </>
      )
    }
);