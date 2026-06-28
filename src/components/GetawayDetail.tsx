import * as React from 'react';
import{ useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Box,
  Stack, Modal,
  Typography, Divider, Button, IconButton,
  Radio, RadioGroup, FormControlLabel, FormControl,
  ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import prevPhoto from '../assets/backgrounds/hotel.jpg';
import { useAuth } from '../contexts/AuthContext';
import type { Getaway } from '../types/getaway';
import { isGetawayExpired } from '../utils/getawayHelpers';
import { ROUTES, bookingPath } from '../constants/routes';
import { BRAND } from '../theme/colors';
import { Role } from '../constants/roles';
import '../App.css';
import GetawaySchedule from './GetawaySchedule';
 
function GetawayDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const getaway: Getaway | null = location.state?.getawayData;
  const expired = isGetawayExpired(getaway);
  const { role, isLoading: isAuthLoading } = useAuth();

  // console.log("Estado de carga:", isLoading, "Rol recibido:", role);
  console.log(getaway);
  const [mainImage, setMainImage] = useState<string | "video">(prevPhoto);
  const [galleryImages, setGalleryImages] = useState<(string | "video")[]>([]);
  const [selectedLodging, setSelectedLodging] = useState<string>("");
  const [selectedAddon, setSelectedAddon] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (getaway) {
      const photos: string[] = getaway.galleryPhotos && getaway.galleryPhotos.length > 0
        ? getaway.galleryPhotos
        : [prevPhoto]; //default img
      const video = getaway.galleryVideo ? ["video"] : [];
      const allMedia = [...photos, ...video];
      setGalleryImages(allMedia);
      setMainImage(allMedia[0] || prevPhoto);

      if (getaway.lodgingOptions && getaway.lodgingOptions.length > 0) {
        setSelectedLodging(getaway.lodgingOptions[0].name);
      }
      if(getaway.optionalAddOns && getaway.optionalAddOns.length > 0){
        setSelectedAddon(getaway.optionalAddOns[0].name);
      }
    }
  }, [getaway]);

  const change = (newSrc: string | "video") => {
    setMainImage(newSrc);
  };

  const revert = () => {
    setMainImage(galleryImages[0] || prevPhoto);
  };

  const openFullScreen = (index: number) => {
    setCurrentIndex(index);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleBookNow = () => {
    if (!getaway?._id) return;
    navigate(bookingPath(getaway._id), { state: { getawayData: getaway } });
    navigate('/booking', { state: { getawayData: getaway } });
  };

  //unavailable getaway error
  if (!getaway) {
    return (
      <Container sx={{ textAlign: 'center', m: 4, pb:30 }}>
        <Typography variant="h4">Getaway not found</Typography>
        <Typography sx={{ mb: 2 }}>The offer data could not be loaded.</Typography>
        <Button size="medium" variant="contained" startIcon={<ArrowBackIcon />}
          onClick={() => navigate(ROUTES.GETAWAYS)}
          sx={{
            m: '1em 0', p: '8px 0.8em', width: '220px',
            borderRadius:'8px', color:BRAND.white, bgcolor: BRAND.primary, textTransform: 'none',
          }}
        > Search more getaways
        </Button>
      </Container>
    );
  }

  // if(isLoading){
  //   return(
  //     <Box display="flex" justifyContent="center" alignItems="center" height={400}>
  //       <CircularProgress />
  //     </Box>
  //   );
  //   //(<Skeleton variant="rectangular" width={300} height={400} sx={{borderRadius:'15px'}}/>);
  // }
  return (
    <>
      <Container sx={{ display:"flex", flexDirection:'column' }}>
        <Stack>
          <Button href={ROUTES.GETAWAYS}
            startIcon={<ArrowBackIcon />} variant="text" size="medium"
            sx={{
              m: '1em 0', p: '8px 0.8em', width: '220px',
              borderRadius:'8px', color:BRAND.black,  textTransform: 'none',
            }}
          > Search more getaways! </Button>
        </Stack>
        
        <Grid container spacing={4} sx={{ width: '100%', alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, md: 5 }} >
            <Stack direction="column" alignItems={{ xs:'center' }}>
              {mainImage === "video" ? (
                <iframe 
                  src={getaway.galleryVideo}
                  title={getaway.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                  style={{ 
                    width: '100%', maxWidth: '100%', 
                    aspectRatio: '16/9', marginBottom: '5px', objectFit: 'contain' 
                  }}
                />
              ) : (
                <img src={mainImage} id="mainImage"
                  onClick={() => openFullScreen(galleryImages.indexOf(mainImage))}
                  alt={getaway.caption || getaway.title}
                  style={{
                    width: '100%', maxHeight: '350px',
                    marginBottom: '5px', objectFit: 'cover'
                }} />
              )}

              {/* minigallery */}
              <Stack direction= 'row' gap={1} sx={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {galleryImages.slice(1).map((image, index) => (
                  image === "video" ? (
                    <Box key={index}
                      sx={{
                        width: '100px',
                        height: '70px',
                        backgroundColor: 'black',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: BRAND.white, borderRadius: '4px',
                        cursor: 'pointer'
                      }} onMouseOver={() => change("video")} onMouseOut={revert}
                      onClick={() => openFullScreen(index + 1)}
                    > Video </Box>
                  ) : (
                    <img key={index} src={image} className="thumbnail"
                      alt={`getaway photo ${index + 2}`}
                      style={{
                      // width: '100px',
                      height: '80px', 
                      objectFit: 'cover', borderRadius: '4px', cursor: 'pointer'}}
                      onMouseOver={() => change(image)}
                      onMouseOut={revert} onClick={() => openFullScreen(index + 1)} 
                    />
                  )
                ))}
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Stack sx={{ fontSize: 15 }}>
              <h3 className='title4'> {getaway.title} </h3>
              {getaway.getawayAddress?.address ? (
                <h5 className='title4'> {getaway.getawayAddress?.address} </h5>
              ):(
                <Typography variant="subtitle2" sx={{fontStyle:'italic', color:'text.secondary'}}>
                No address provided</Typography>
              )}

              {/* {rcnet.name ? ( */}
                <h5 className='title4'>
                  By RCnet
                  {/* {rcnet.name} */}
                </h5>
              {/* ):( */}
                <Typography variant="subtitle2" sx={{fontStyle:'italic', color:'text.secondary'}}>Provider name unavailable</Typography>
              {/* )} */}
              <p className='paragraph'> {getaway.overview} </p>
              <div className='inline'>
                <h4 className='title4'>Dates:</h4>
                <span> {getaway.startDate} - {getaway.endDate}</span>
              </div>

              <FormControl>
                <h4 className='title4'>Rates Start at:</h4>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={selectedLodging}
                  onChange={(e) => setSelectedLodging(e.target.value)}
                >
                  {getaway.lodgingOptions && getaway.lodgingOptions.length > 0 ? (
                    getaway.lodgingOptions.map((option, index) => (
                      <FormControlLabel 
                        // variant="subtitle2"???
                        sx={{mt:0}}
                        key={index}
                        value={option.name}
                        control={<Radio />}
                        label={`${option.name} - $${option.price} ` }
                      />
                    ))
                  ) : (
                    <Typography variant="subtitle2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Unavailable lodging prices</Typography>
                  )}
                </RadioGroup>
              </FormControl>

              {expired ? (
                <Typography sx={{ mt: 1, mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                  This getaway has ended — subscription is no longer available.
                </Typography>
              ) : (
                role === Role.PLAYER && (
                  <Button type="submit" onClick={handleBookNow}
                    startIcon={<ShoppingCartIcon />} variant="contained"
                    sx={{
                      mt: 1, mb: 3, width: '15vw', borderRadius:'8px',
                      bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                      ':hover': {
                        bgcolor: BRAND.white, color: BRAND.primary,
                      }
                    }}
                  > Book now </Button>
                )
              )}
            </Stack>
          </Grid>
        </Grid>

        <Modal sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor:BRAND.purpleBg }}
          open={isFullScreen} onClose={closeFullScreen}
        >
          <Box sx={{ position: 'relative', width: '90%', height: '90%', color: BRAND.white }}>
            <IconButton
              sx={{ position: 'absolute', top: 10, right: 10, color: BRAND.white }}
              onClick={closeFullScreen}
            > <CloseIcon />
            </IconButton>

            <IconButton onClick={handlePrev}
              sx={{ position: 'absolute', top: '50%', left: 10, color: BRAND.white, transform: 'translateY(-50%)' }}
            > <ArrowBackIosIcon />
            </IconButton>

            <IconButton
              sx={{ position: 'absolute', top: '50%', right: 10, color: BRAND.white, transform: 'translateY(-50%)' }}
              onClick={handleNext}
            > <ArrowForwardIosIcon />
            </IconButton>

            <h3 className='titleLeft'>{getaway.title}</h3>
            <h5 className='titleLeft'>{getaway.getawayAddress?.address || 'No address provided'}</h5>
            <center>
              {galleryImages[currentIndex] === "video" ? (
                <iframe width="1280" height="519" src={getaway.galleryVideo} title={getaway.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{ width: '55vw', maxHeight: '35vw', objectFit: 'contain' }} />
              ) : (
                <img src={galleryImages[currentIndex]} alt="Full screen" style={{ width:'55vw', maxHeight: '35vw', objectFit:'contain' }} />
              )}
            </center>
            <Stack gap={1}
              sx={{
                display:"flex", flexDirection: 'row',
                alignItems: 'flex-start', alignContent: 'flex-start',
                flexWrap : 'wrap',
                justifyContent: 'space-around',
                color: BRAND.white
              }}
            >
              <Stack sx={{ fontSize: 15, width: '60vw' }}>
                <p className='paragraph'> {getaway.mainDescription || getaway.overview } </p>
              </Stack>
              {!expired && ( 
                role === Role.PLAYER && (
                  <Button type="submit" startIcon={<ShoppingCartIcon />} variant="contained"
                    onClick={handleBookNow}
                    sx={{
                      mt: 1, mb: 3, borderRadius:'8px',
                      minWidth: '12vw', maxWidth: '13vw',
                      bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                      ':hover': { bgcolor: BRAND.white, color: BRAND.primary},
                      borderColor: 'primary.main', border: 1
                    }}
                  > Book now </Button>
                )
              )}
            </Stack>
          </Box>
        </Modal>
      </Container>
      <Container sx={{ display:"flex", flexDirection: 'column', mt: 3, mb: 3 }} >
        <Stack>
          <h4 className='title4'>Description</h4>
          <Divider aria-hidden="true" sx={{bgcolor:BRAND.primary}} />
          {getaway.mainDescription ? (
            <p className='paragraph'> {getaway.mainDescription} </p>
          ):( 
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
              No description provided
            </Typography>
          )}
          <h4 className='title4'>Weekend Schedule</h4>
          <Divider aria-hidden="true" sx={{bgcolor:BRAND.primary}} />
          <GetawaySchedule schedule={getaway.schedule}/>
          {/* <Stack sx={{ flexWrap: 'wrap' }}>
            <table>
              <colgroup>
                <col />
                <col />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Activity</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {getaway.schedule && getaway.schedule.length > 0 ? (
                  getaway.schedule.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Stack direction="column" spacing={0.5}>
                          <strong>{item.date}</strong>
                          <span>{item.startTime}-{item.endTime}</span>
                        </Stack>
                      </td>
                      <td>{item.activity}</td>
                      <td>{item.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <Typography sx={{fontStyle:'italic', color:'text.secondary'}}>The schedule is not currently available</Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Stack> */}
          <Stack spacing={1} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }} >
            <h5 className='title4'>This getaway includes</h5>
            {getaway.amenities && getaway.amenities.length > 0 ? (
              <ul>
                {getaway.amenities.map((item, index) => (
                  <li key={index}>{item.name || 'No amenities included.'}</li>
                ))}
              </ul>
            ) : (
              <Typography sx={{fontStyle:'italic', color:'text.secondary'}}> No amenities included yet </Typography>
            )}
          </Stack>
          <Stack 
            // spacing={1} 
            sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }}>        
            <h5 className='title4'> Optional Add Ons </h5>
            {getaway.optionalAddOns && getaway.optionalAddOns.length > 0 ? (
              getaway.optionalAddOns.map((option, index) => (
                <ListItem>
                  <ListItemText
                    key={index}
                    primary={option.name}
                    secondary={`$ ${option.price}`}
                  />
                </ListItem>
              ))
            ):(
              <Typography sx={{fontStyle:'italic', color:'text.secondary'}}>Unavailable Add Ons</Typography>
            )}
          </Stack>
          <Stack spacing={1} sx={{ mt:0, justifyContent:'flex-start', flexWrap:'wrap' }} >
            <h5 className='title4'>Payments & Policies</h5>
            {getaway.policies ? (
              <p className='paragraph'> {getaway.policies} </p>
            ):(
              <Typography sx={{fontStyle:'italic', color:'text.secondary'}}>No included</Typography>
            )}
          </Stack>
          <Stack spacing={1} sx={{ mt: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }} >
            <h5 className='title4'>Términos y Condiciones</h5>
            {getaway.terms ? (
              <p className='paragraph'> {getaway.terms} </p>
            ):(
              <Typography sx={{fontStyle:'italic', color:'text.secondary'}}>No included</Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={3}
            sx={{
              mt: 2, mb: 2, flexWrap: 'wrap',
              justifyContent:{ xs:'center', md:'flex-start'},
              alignItems: 'center', alignContent: 'center', gap:{ xs:'12px'}
            }}
          >
            <h5 className='title5'>For more information:</h5>
            <Button target="_blank"
              startIcon={<MailIcon />} size="small" variant="contained"
              // href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2uQZp2vPrJmwVmMkqMgVci1kx_lFIPox1JCBWoQfmLMymNhbW6k54PNtVBesApbXi7BdVBDewG"
              sx={{
                mt: 1, mb: 2, borderRadius:'8px',
                width: '12vw', minWidth:'125px',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary}
              }}
            > Send mail </Button>
            <Button startIcon={<WhatsAppIcon />}
              href="https://wa.me/codeNumber"
              size="small" target="_blank" variant="contained"
              sx={{
                mt: 1, mb: 2, borderRadius:'8px',
                width: '12vw', minWidth:'125px',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary }
              }}
            > WhatsApp </Button>
            <Button startIcon={<HelpCenterIcon />}
              size="small" variant="contained" target="_blank"
              href="https://racquetsappsuite.com/"
              sx={{
                mt: 1, mb: 4, borderRadius:'8px',
                width: '12vw', minWidth:'125px',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary }
              }}
            > FAQs </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  )
}
export default GetawayDetail;