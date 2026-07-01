// import * as React from 'react';
import{ useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  Container, Box, Stack, Modal,
  Typography, Divider, Button, IconButton,
  Radio, RadioGroup, FormControlLabel, FormControl,
  ListItem, ListItemText, CircularProgress, Alert
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
import { BRAND } from '../theme/colors';
import '../App.css';

import { useAuth } from '../contexts/AuthContext';
import type { Getaway } from '../types/getaway';
import { useGetawayById } from '../hooks/useGetawayById';
import { isGetawayExpired } from '../utils/getawayHelpers';
import { ROUTES, bookingPath } from '../constants/routes';
import { Role } from '../constants/roles';
import GetawaySchedule from './GetawaySchedule';

function GetawayDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // const { role, isLoading: isAuthLoading } = useAuth();
  const { role } = useAuth();
  const location = useLocation();
  const { data: apiGetaway, loading, error } = useGetawayById(id || '');
  const getaway: Getaway | null = location.state?.getawayData || apiGetaway;
  const expired = isGetawayExpired(getaway);

  // console.log("Estado de carga:", isLoading, "Rol recibido:", role);
  // console.log(getaway);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mainBoxRef = useRef<HTMLDivElement>(null);
  const [mainBoxWidth, setMainBoxWidth] = useState(0);

  const [mainImage, setMainImage] = useState<string | "video">(prevPhoto);
  const [galleryImages, setGalleryImages] = useState<(string | "video")[]>([]);
  const [selectedLodging, setSelectedLodging] = useState<string>("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  //Observer for gallery container
  useEffect(() => {
    const el = mainBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setMainBoxWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    }
  }, [getaway]);

  const change = (newSrc: string | "video") => {
    setImageLoaded(false);
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

  // if (isAuthLoading) {
  if (loading && !location.state?.getawayData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error && !location.state?.getawayData) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

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
            <Stack direction="column" onMouseLeave={revert}>
              <Box ref={mainBoxRef}
                sx={{
                  width: '100%',
                  paddingTop: '56.25%', // 16/9 = 56.25% aspectRatio
                  position: 'relative',
                  marginBottom: '15px',
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                  borderRadius: '4px',
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                {mainImage === "video" ? (
                  <iframe
                    src={getaway.galleryVideo}
                    title={getaway.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '100%', height: '100%',
                    }}
                  />
                ) : (
                  <>
                    {!imageLoaded && (
                      <Box sx={{
                        position: 'absolute', inset: 0,
                        backgroundColor: '#2a2a2a',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        }
                      }} />
                    )}
                    <img
                      src={mainImage} id="mainImage"
                      onLoad={() => setImageLoaded(true)}
                      onClick={() => openFullScreen(galleryImages.indexOf(mainImage))}
                      alt={getaway.caption || getaway.title}
                      style={{
                        position: 'absolute', top: 0, left: 0,
                        width: '100%', height: '100%',
                        objectFit: 'contain',
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'opacity 0.2s ease-in-out',
                      }}
                    />
                  </>
                )}
              </Box>

              {/* mini gallery */}
              {mainBoxWidth >= 200 && galleryImages.length > 1 && (
                <Box sx={{
                  width: '100%',
                  minHeight: '88px', // 80px thumbnail + 8px gap buffer since previous render
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Stack direction='row' gap={1}
                    sx={{ flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start', alignContent: 'flex-start'}}
                  >
                    {galleryImages.slice(1).map((image, index) => {
                      const isVideo = image === "video";
                      return (
                        <Box key={index}
                          sx={{
                            width: '100px',
                            height: '80px',
                            minHeight: '80px',
                            backgroundColor: 'black',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                          onMouseEnter={() => change(isVideo ? "video" : image)}
                          onClick={() => openFullScreen(index + 1)}
                        >
                          {isVideo ? (
                            <span style={{ color: BRAND.white, fontSize: '14px' }}>Video</span>
                          ) : (
                            <img
                              src={image} alt={`getaway photo ${index + 2}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              )}
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
                    startIcon={<ShoppingCartIcon/>} variant="contained"
                    sx={{
                      mt: 1, mb: 3, width:'128px', borderRadius:'8px',
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
            <Stack
              sx={{
                display:"flex", flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                flexWrap : 'wrap',
                justifyContent: 'space-evenly',
                color: BRAND.white
              }}
            >
              <Stack sx={{ fontSize: 15, width: '55vw' }}>
                <p className='paragraph'> {getaway.mainDescription || getaway.overview } </p>
              </Stack>
              {!expired && (
                role === Role.PLAYER && (
                  <Button type="submit" startIcon={<ShoppingCartIcon />} variant="contained"
                    onClick={handleBookNow}
                    sx={{
                      mt: 1, mb: 3, borderRadius:'8px',
                      width:'130px',
                      bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                      ':hover': { bgcolor: BRAND.white, color: BRAND.primary},
                      borderColor: 'primary.main', border: 1
                    }}
                  >Book now</Button>
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
          <GetawaySchedule schedule={getaway.schedule || []}/>

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
                <ListItem key={index}>
                  <ListItemText
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
            <Button target="_blank" component="a"
              startIcon={<MailIcon />} size="small" variant="contained"
              href="https://racquetsappsuite.com/contact/general-support/"
              sx={{
                mt: 1, mb: 2, borderRadius:'8px',
                width: '12vw', minWidth:'125px',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary}
              }}
            > Send mail </Button>
            <Button startIcon={<WhatsAppIcon />} component="a"
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