import{ useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Box,
  Divider, Button, IconButton,
  Stack,
  Modal,
  Typography,
  Radio, RadioGroup, FormControlLabel, FormControl
} from '@mui/material';

// import view1 from '../assets/backgrounds/clubView1.png';
// import view2 from '../assets/backgrounds/hotel.jpg';
// import view4 from '../assets/backgrounds/padel.jpg';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import prevPhoto from '../assets/backgrounds/hotel.jpg';

import type { Getaway } from '../types/getaway';
import { isGetawayExpired } from '../utils/getawayHelpers';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';

function GetawayDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const getaway: Getaway | null = location.state?.getawayData;
  const expired = isGetawayExpired(getaway);

  const [mainImage, setMainImage] = useState<string | "video">(prevPhoto);
  const [galleryImages, setGalleryImages] = useState<(string | "video")[]>([]);
  const [selectedLodging, setSelectedLodging] = useState<string>("");

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
    navigate(ROUTES.BOOK_GETAWAY, { state: { getawayData: getaway } });
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

  return (
    <>
      <Container sx={{ display:"flex", flexDirection: 'column' }}>
        <Stack>
          <Button href={ROUTES.GETAWAYS}
            startIcon={<ArrowBackIcon />} variant="text" size="medium"
            sx={{
              m: '1em 0', p: '8px 0.8em', width: '220px',
              borderRadius:'8px', color:BRAND.black,  textTransform: 'none',
            }}
          > Search more getaways! </Button>
        </Stack>
        <Stack gap={1}
          sx={{
            display:"flex", flexDirection: 'row',
            alignItems: 'flex-start', alignContent: 'flex-start', justifyContent: 'flex-start',
          }}
        >
          <Stack>
            {mainImage === "video" ? (
              <iframe width="1280" height="519"
                // src="https://www.youtube.com/embed/dv_hzU3gw34"
                src={getaway.galleryVideo}
                title={getaway.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                style={{ maxWidth: '39vw', marginBottom: '5px', objectFit: 'contain' }}
              />
            ) : (
              <img src={mainImage} id="mainImage"
                onClick={() => openFullScreen(galleryImages.indexOf(mainImage))}
                alt={getaway.caption || getaway.title}
                style={{
                  maxHeight: '30vw',
                  maxWidth: '39vw',
                  marginBottom: '5px',
                  objectFit: 'contain'
              }} />
            )}
            <Stack
              sx={{
                display: "flex", flexDirection: 'row',
                width: '39vw',
                maxHeight: '30vw', maxWidth: '39vw',
                flexWrap: 'wrap', alignItems: 'center', alignContent: 'center', justifyContent: 'space-between',
              }}
            >
              {galleryImages.slice(1).map((image, index) => (
                image === "video" ? (
                  <Box key={index}
                    sx={{
                      width: '160px', height: '100px',
                      backgroundColor: 'black',
                      display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: BRAND.white,
                      cursor: 'pointer'
                    }} onMouseOver={() => change("video")} onMouseOut={revert}
                    onClick={() => openFullScreen(index + 1)}
                  >
                    Video
                  </Box>
                ) : (
                  <img key={index} src={image} className="thumbnail"
                    alt={`getaway photo ${index + 2}`}
                    style={{ width: '160px', height: '100px'}}
                    onMouseOver={() => change(image)}
                    onMouseOut={revert} onClick={() => openFullScreen(index + 1)} />
                )
              ))}
            </Stack>
          </Stack>

          <Stack sx={{ fontSize: 15, ml: 2, flexGrow: 1 }}>
            <h3 className='title4'> {getaway.title} </h3>
            <h5 className='title4'>
              {getaway.getawayAddress?.address || 'No address provided'}
            </h5>
            <h5 className='title4'>
              By
              {/* {rcnet.name ||  */}
               {' Getaway name unavailable'}
              {/* } */}
            </h5>
            <p> {getaway.overview} </p>

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
                      key={index}
                      value={option.name}
                      control={<Radio />}
                      label={`${option.name} - $${option.price} ` }
                    />
                  ))
                ) : (
                  <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Unavailable prices</Typography>
                )}
              </RadioGroup>
            </FormControl>

            {expired ? (
              <Typography sx={{ mt: 1, mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                This getaway has ended — subscription is no longer available.
              </Typography>
            ) : (
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
            )}
          </Stack>
        </Stack>

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
                <p> {getaway.mainDescription || getaway.overview } </p>
              </Stack>
              {!expired && (
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
              )}
            </Stack>
          </Box>
        </Modal>
      </Container>
      <Container sx={{ display:"flex", flexDirection: 'column', mt: 3, mb: 3 }} >
        <Stack>
          <h4 className='title4'>Description</h4>
          <Divider aria-hidden="true" sx={{bgcolor:BRAND.primary}} />
          <p>
            {getaway.mainDescription || 'No description provided' }
          </p>

          <h4 className='title4'>Weekend Schedule</h4>
          <Divider aria-hidden="true" sx={{bgcolor:BRAND.primary}} />
          <Stack sx={{ flexWrap: 'wrap' }}>
            <table>
              <col />
              <col />
              <col />
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
                        {item.date}
                        {/* {item.date.hour} */}
                      </td>
                      <td>{item.activity}</td>
                      <td>{item.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3}>The schedule is not currently available</td></tr>
                )}
              </tbody>
            </table>
          </Stack>
          <Stack spacing={1} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'flex-start' }} >
            <h5 className='title4'>This getaway includes</h5>
            <ul>
              {getaway.amenities && getaway.amenities.length > 0 ? (
                getaway.amenities.map((item, index) => (
                  <li key={index}>{item.name || 'No amenities included.'}</li>
                ))
              ) : (
                <li> No amenities included yet </li> //not shown
              )}
            </ul>
          </Stack>
          <Stack spacing={1} sx={{ mt: 2, mb: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }} >
            <h5 className='title4'>Payments & Policies</h5>
            <p>{getaway.policies || 'No included'}</p>
          </Stack>
          <Stack spacing={1} sx={{ mt: 2, mb: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }} >
            <h5 className='title4'>Términos y Condiciones</h5>
            <p style={{ whiteSpace: 'pre-wrap' }}>{getaway.terms || 'No included'}</p>
          </Stack>
          <Stack direction="row" spacing={3}
            sx={{
              mt: 2, mb: 2,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              alignItems: 'center', alignContent: 'center'
            }}
          >
            <h5 className='title5'>For more information:</h5>
            <Button target="_blank"
              startIcon={<MailIcon />} size="small" variant="contained"
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2uQZp2vPrJmwVmMkqMgVci1kx_lFIPox1JCBWoQfmLMymNhbW6k54PNtVBesApbXi7BdVBDewG"
              sx={{
                mt: 1, mb: 2, borderRadius:'8px',
                width: '12vw',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary}
              }}
            > Send mail
            </Button>
            <Button startIcon={<WhatsAppIcon />}
              href="https://wa.me/codeNumber"
              size="small" target="_blank" variant="contained"
              sx={{
                mt: 1, mb: 2, borderRadius:'8px',
                width: '12vw',
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary }
              }}
            > WhatsApp </Button>
            <Button startIcon={<HelpCenterIcon />}
              size="small" variant="contained" target="_blank"
              href="https://racquetsappsuite.com/"
              sx={{
                mt: 1, mb: 4, borderRadius:'8px',
                width: '12vw',
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