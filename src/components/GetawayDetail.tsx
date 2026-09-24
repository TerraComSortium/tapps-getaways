// import * as React from 'react';
import{ useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container, Box, Stack, Modal, Paper, Chip,
  Typography, Divider, Button, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Avatar, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MailIcon from '@mui/icons-material/Mail';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ShareIcon from '@mui/icons-material/Share';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PlaceIcon from '@mui/icons-material/Place';
import NotesIcon from '@mui/icons-material/Notes';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import GavelIcon from '@mui/icons-material/Gavel';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckIcon from '@mui/icons-material/Check';
import prevPhoto from '../assets/backgrounds/hotel.jpg';
import { BRAND } from '../theme/colors';
import '../App.css';

import { useAuth } from '../contexts/AuthContext';
import type { Getaway } from '../types/getaway';
import { useGetawayById } from '../hooks/useGetawayById';
import { useMyOrderForGetaway } from '../hooks/useMyOrderForGetaway';
import { useInvoice } from '../hooks/useInvoice';
import { getSportLabel, isGetawayExpired } from '../utils/getawayHelpers';
import { toEmbedUrl } from '../utils/videoUrl';
import { ROUTES, bookingPath } from '../constants/routes';
import { Role } from '../constants/roles';
import GetawaySchedule from './GetawaySchedule';
import AcademySchedule from './AcademySchedule';
import TournamentsSchedule from './TournamentsSchedule';
import LaddersSchedule from './LaddersSchedule';
import type { AcademyClass } from '../hooks/useGetAcademy';
import type { Tournament } from '../services/tournament';
import type { Ladder } from '../services/ladder';
import { useTranslation } from 'react-i18next';

/** Bloque con cabecera (icono + título) para agrupar el contenido del detalle. */
const Section = ({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <Paper
    elevation={0}
    sx={{ p: { xs: 2, sm: 3 }, mb: 2.5, borderRadius: '12px', bgcolor: 'background.paper' }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
      <Box sx={{ color: BRAND.primary, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontSize: 16, fontWeight: 'bold', color: BRAND.primary }}>
        {title}
      </Typography>
    </Stack>
    <Divider aria-hidden="true" sx={{ bgcolor: BRAND.primary, mb: 2 }} />
    {children}
  </Paper>
);

/** Texto de "aquí todavía no hay nada", que se repetía en cada bloque. */
/**
 * Acción principal del detalle: si el jugador ya pagó este getaway no tiene
 * sentido volver a cobrarle, así que se le ofrece su factura.
 */
const PrimaryAction = ({
  isPaid, onBook, onInvoice, downloading, label, invoiceLabel, sx,
}: {
  isPaid: boolean;
  onBook: () => void;
  onInvoice: () => void;
  downloading: boolean;
  label: string;
  invoiceLabel: string;
  sx?: object;
}) => (
  <Button
    variant="contained"
    onClick={isPaid ? onInvoice : onBook}
    disabled={isPaid && downloading}
    startIcon={
      isPaid
        ? (downloading ? <CircularProgress size={18} color="inherit" /> : <ReceiptLongIcon />)
        : <ShoppingCartIcon />
    }
    sx={{
      minWidth: '130px', whiteSpace: 'nowrap', px: 2, borderRadius: '8px',
      bgcolor: isPaid ? BRAND.green : BRAND.primary,
      color: isPaid ? BRAND.navy : BRAND.white,
      fontWeight: 'bold', textTransform: 'none',
      ':hover': { bgcolor: BRAND.white, color: BRAND.primary },
      ...sx,
    }}
  >
    {isPaid ? invoiceLabel : label}
  </Button>
);

const EmptyText = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="subtitle2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
    {children}
  </Typography>
);

function GetawayDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // const { role, isLoading: isAuthLoading } = useAuth();
  const { role } = useAuth();
  const location = useLocation();
  const { data: apiGetaway, loading, error } = useGetawayById(id || '');
  // El objeto que llega por `state` viene del LISTADO (`getAllOffers`/`getOffersByRCNET`),
  // que NO hidrata academyClasses/tournaments/ladders — solo lo hace `getOffer`.
  // Por eso se usa únicamente como placeholder mientras carga: en cuanto llega la
  // respuesta del endpoint por id, esa manda.
  const getaway: Getaway | null = apiGetaway ?? location.state?.getawayData ?? null;
  const expired = isGetawayExpired(getaway);

  // El backend completa el getaway con los documentos de academia, torneos y
  // ladders a partir de los ids que se guardaron al crearlo. No se consulta nada
  // más: el filtro por fechas/deporte es cosa del formulario de creación.
  const academyClasses = (getaway?.academyClasses as AcademyClass[] | undefined) ?? [];
  const tournaments = (getaway?.tournaments as Tournament[] | undefined) ?? [];
  const ladders = (getaway?.ladders as Ladder[] | undefined) ?? [];

  // Precio "desde" que el backend guardó al crear el getaway (alojamiento más
  // barato + actividades incluidas). Viene también en el listado, así que se ve
  // al instante. Los getaways creados antes no lo tienen: no se muestra.
  const storedPrice = Number(getaway?.price) || 0;
  const owner = getaway?.owner ?? null;
  // El enlace se guarda tal cual lo pega el admin (watch?v=…, youtu.be/…), que
  // YouTube no permite embeber. Se normaliza a /embed/ antes de usarlo.
  const embedVideoUrl = toEmbedUrl(getaway?.galleryVideo);

  // Si el jugador ya pagó este getaway, en vez de reservar otra vez se le ofrece
  // su factura. Solo se consulta para PLAYER: al admin no le aplica.
  const { order: myOrder, isPaid } = useMyOrderForGetaway(id, role === Role.PLAYER);
  const { download: downloadInvoice, loading: downloadingInvoice } = useInvoice();


  // console.log("Estado de carga:", isLoading, "Rol recibido:", role);
  // console.log(getaway);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mainBoxRef = useRef<HTMLDivElement>(null);
  const [mainBoxWidth, setMainBoxWidth] = useState(0);

  const [mainImage, setMainImage] = useState<string | "video">(prevPhoto);
  const [galleryImages, setGalleryImages] = useState<(string | "video")[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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
      const video = toEmbedUrl(getaway.galleryVideo) ? ["video"] : [];
      const allMedia = [...photos, ...video];
      setGalleryImages(allMedia);
      setMainImage(allMedia[0] || prevPhoto);

      // console.log('july', JSON.stringify(getaway, null, 2));
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

  const handleShare = async () => {
    const currentUrl = window.location.href; //capture url
    if (navigator.share) {
      try {
        await navigator.share({
          title: getaway?.title || t('detail.shareTitle'),
          text: getaway?.overview || t('detail.shareText'),
          url: currentUrl,
        });
        return;
      } catch (err) {
        console.log('Navegador canceló o bloqueó el share nativo, usando fallback...');
      }
    }
    // Fallback web
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);//revert
    } catch (err) {
      console.error('Error while copying url: ', err);
    }
  };

  //unavailable getaway error
  if (!getaway) {
    return (
      <Container sx={{ textAlign: 'center', m: 4, pb:30 }}>
        <Typography variant="h4">{t('detail.notFound')}</Typography>
        <Typography sx={{ mb: 2 }}>{t('detail.notFoundDetail')}</Typography>
        <Button size="medium" variant="contained" startIcon={<ArrowBackIcon />}
          component={RouterLink} to={ROUTES.GETAWAYS}
          sx={{
            m: '1em 0', p: '8px 0.8em', minWidth: '220px', whiteSpace: 'nowrap',
            borderRadius:'8px', color:BRAND.white, bgcolor: BRAND.primary, textTransform: 'none',
          }}
        > {t('detail.searchMore')}
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
                    src={embedVideoUrl ?? undefined}
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
                            <span style={{ color: BRAND.white, fontSize: '14px' }}>{t('detail.video')}</span>
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
              {/* Orden: qué es → cuándo y de qué → dónde → quién → de qué va → cuánto */}
              <h3 className='title4' style={{ marginBottom: 8 }}>{getaway.title}</h3>

              <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
                {getaway.sport && (
                  <Chip
                    size="small"
                    icon={<SportsTennisIcon />}
                    label={getSportLabel(getaway.sport)}
                    sx={{ bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'bold' }}
                  />
                )}
                {(getaway.startDate || getaway.endDate) && (
                  <Chip
                    size="small" variant="outlined"
                    icon={<CalendarMonthIcon />}
                    label={`${getaway.startDate} - ${getaway.endDate}`}
                    sx={{ borderColor: BRAND.primary, color: BRAND.primary, fontWeight: 500 }}
                  />
                )}
              </Stack>

              {getaway.getawayAddress?.address ? (
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getaway.getawayAddress.address)}`}
                  target="_blank" rel="noopener" underline="hover"
                  sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    color: 'text.secondary', ':hover': { color: BRAND.primary },
                  }}
                >
                  <PlaceIcon sx={{ fontSize: 18, color: BRAND.primary }} />
                  <Typography variant="body2" component="span">
                    {getaway.getawayAddress.address}
                  </Typography>
                </Link>
              ) : (
                <Typography variant="subtitle2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                  {t('detail.noAddress')}
                </Typography>
              )}

              {/* El backend resuelve `ownerId` y adjunta `owner` con nombre y correo. */}
              {owner && (owner.clubName || owner.name) ? (
                <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mt: 2 }}>
                  <Avatar
                    src={owner.photoURL || undefined}
                    sx={{ width: 38, height: 38, bgcolor: BRAND.primary, fontSize: 15 }}
                  >
                    {(owner.clubName || owner.name).charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {t('detail.organizedBy')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
                      {owner.clubName || owner.name}
                    </Typography>
                    {owner.clubName && owner.name && (
                      <Typography variant="caption" color="text.secondary">
                        {owner.name}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              ) : (
                <Typography variant="subtitle2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                  {t('detail.providerUnavailable')}
                </Typography>
              )}

              <Divider aria-hidden="true" sx={{ my: 2 }} />

              {getaway.overview && <p className='paragraph' style={{ marginTop: 0 }}>{getaway.overview}</p>}

              {storedPrice > 0 && (
                <Box>
                  <h4 className='title4'>{t('detail.ratesStartAt')}</h4>
                  <Typography sx={{ fontSize: 28, fontWeight: 'bold', color: BRAND.primary, lineHeight: 1.2 }}>
                    ${storedPrice.toLocaleString(i18n.language, { maximumFractionDigits: 2 })}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.75 }}>
                      {t('detail.plusTax')}
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, mb: 1 }}>
                    {t('detail.priceNote')}
                  </Typography>
                </Box>
              )}

              {expired ? (
                <Typography sx={{ mt: 1, mb: 3, fontStyle: 'italic', color: 'text.secondary' }}>
                  {t('detail.ended')}
                </Typography>
              ) : (
                <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 1, }}
                  alignItems={{ xs:'center', md:'flex-start'}}
                >
                  { role === Role.PLAYER && (
                    <PrimaryAction
                      isPaid={isPaid}
                      onBook={handleBookNow}
                      onInvoice={() => downloadInvoice(myOrder?.orderId || myOrder?.id || '')}
                      downloading={downloadingInvoice}
                      label={t('detail.bookNow')}
                      invoiceLabel={t('detail.downloadInvoice')}
                    />
                  )}
                  <Button variant="contained"
                    onClick={handleShare} startIcon={copied ? <CheckIcon /> : <ShareIcon />}
                    sx={{
                      minWidth: '128px', whiteSpace: 'nowrap', px: 2, borderRadius:'8px',
                      bgcolor: copied ? '#00E392' : BRAND.primary,
                      fontWeight: 'semibold', textTransform: 'none',
                      color: copied ? BRAND.primary : BRAND.white,
                      transition: 'all 0.3s ease',
                      ':hover': {
                        bgcolor: copied ? '#00c77f' : BRAND.white, 
                        color: copied ? BRAND.primary : BRAND.primary,
                      }
                    }}
                  >{copied ? t('detail.copied') : t('detail.share')}</Button>
                </Stack>
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
            <h5 className='titleLeft'>{getaway.getawayAddress?.address || t('detail.noAddress')}</h5>
            <center>
              {galleryImages[currentIndex] === "video" ? (
                <iframe width="1280" height="519" src={embedVideoUrl ?? undefined} title={getaway.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen style={{ width: '55vw', maxHeight: '35vw', objectFit: 'contain' }} />
              ) : (
                <img src={galleryImages[currentIndex]} alt={getaway.galleryPhotoCaptions?.[currentIndex] || "Full screen"} style={{ width:'55vw', maxHeight: '35vw', objectFit:'contain' }} />
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
                <p className='paragraph'>
                  {(() => {
                    if (galleryImages[currentIndex] === "video") {
                      return getaway.mainDescription || "";
                    }
                    const photoIndex = galleryImages[0] === "video" ? currentIndex - 1 : currentIndex;
                    const currentCaption = getaway.galleryPhotoCaptions?.[photoIndex];
                    return currentCaption && currentCaption.trim() !== ""
                      ? currentCaption
                      : getaway.mainDescription || "";
                  })()}
                </p>
              </Stack>
              {!expired && (
                role === Role.PLAYER && (
                  <PrimaryAction
                    isPaid={isPaid}
                    onBook={handleBookNow}
                    onInvoice={() => downloadInvoice(myOrder?.orderId || myOrder?.id || '')}
                    downloading={downloadingInvoice}
                    label={t('detail.bookNow')}
                    invoiceLabel={t('detail.downloadInvoice')}
                    sx={{ mt: 1, mb: 3 }}
                  />
                )
              )}
            </Stack>
          </Box>
        </Modal>
      </Container>
      <Container sx={{ display: 'flex', flexDirection: 'column', mt: 3, mb: 3 }}>
        <Section icon={<NotesIcon />} title={t('detail.description')}>
          {getaway.mainDescription ? (
            <p className='paragraph' style={{ margin: 0 }}>{getaway.mainDescription}</p>
          ) : (
            <EmptyText>{t('detail.noDescription')}</EmptyText>
          )}
        </Section>

        {/* Agenda propia del getaway + las sesiones de Academy, torneos y ladders
            que se incluyeron al crearlo (cada tabla se oculta sola si está vacía). */}
        <Section icon={<EventNoteIcon />} title={t('detail.weekendSchedule')}>
          <GetawaySchedule schedule={getaway.schedule || []} address={getaway.getawayAddress?.address} />
          <AcademySchedule
            mode="readonly"
            showPrice={false}
            schedules={academyClasses}
            loading={false}
            selectedIds={getaway.academyIds || []}
          />
          <TournamentsSchedule
            mode="readonly"
            showPrice={false}
            selectedIds={getaway.tournamentIds || []}
            items={tournaments}
          />
          <LaddersSchedule
            mode="readonly"
            showPrice={false}
            selectedIds={getaway.ladderIds || []}
            items={ladders}
          />
        </Section>

        <Section icon={<CheckCircleOutlineIcon />} title={t('detail.includes')}>
          {getaway.amenities && getaway.amenities.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {getaway.amenities
                .filter((item) => item.name?.trim())
                .map((item, index) => (
                  <Chip
                    key={index}
                    icon={<CheckCircleOutlineIcon />}
                    label={item.name}
                    sx={{ bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 500 }}
                  />
                ))}
            </Stack>
          ) : (
            <EmptyText>{t('detail.noAmenitiesYet')}</EmptyText>
          )}
        </Section>

        <Section icon={<AddShoppingCartIcon />} title={t('detail.optionalAddOns')}>
          {getaway.optionalAddOns && getaway.optionalAddOns.length > 0 ? (
            <Stack divider={<Divider flexItem />}>
              {getaway.optionalAddOns.map((option, index) => (
                <Stack
                  key={index}
                  direction="row" spacing={2}
                  sx={{ justifyContent: 'space-between', alignItems: 'center', py: 1 }}
                >
                  <Typography variant="body2">{option.name}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
                    ${option.price}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyText>{t('detail.unavailableAddOns')}</EmptyText>
          )}
        </Section>

        {/* Políticas y términos van juntos: son el mismo tipo de lectura legal. */}
        <Section icon={<GavelIcon />} title={t('detail.paymentsPolicies')}>
          {getaway.policies ? (
            <p className='paragraph' style={{ marginTop: 0 }}>{getaway.policies}</p>
          ) : (
            <EmptyText>{t('detail.notIncluded')}</EmptyText>
          )}

          <Typography sx={{ mt: 3, mb: 1, fontSize: 15, fontWeight: 'bold', color: BRAND.primary }}>
            {t('detail.termsConditions')}
          </Typography>
          {getaway.terms ? (
            <p className='paragraph' style={{ marginTop: 0 }}>{getaway.terms}</p>
          ) : (
            <EmptyText>{t('detail.notIncluded')}</EmptyText>
          )}
        </Section>

        <Section icon={<ContactSupportIcon />} title={t('detail.moreInfo')}>
          <Stack
            direction="row" spacing={1.5}
            sx={{ flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}
            useFlexGap
          >
            <Button target="_blank" component="a"
              startIcon={<MailIcon />} size="small" variant="contained"
              href={owner?.email
                ? `mailto:${owner.email}?subject=${encodeURIComponent(getaway.title || '')}`
                : 'https://racquetsappsuite.com/contact/general-support/'}
              sx={{
                borderRadius: '8px', minWidth: '125px', whiteSpace: 'nowrap', px: 2,
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary },
              }}
            > {t('detail.sendMail')} </Button>
            <Button startIcon={<WhatsAppIcon />} component="a"
              href={owner?.phone
                ? `https://wa.me/${owner.phone.replace(/\D/g, '')}`
                : 'https://racquetsappsuite.com/'}
              size="small" target="_blank" variant="contained"
              sx={{
                borderRadius: '8px', minWidth: '125px', whiteSpace: 'nowrap', px: 2,
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary },
              }}
            > {t('detail.whatsapp')} </Button>
            <Button startIcon={<HelpCenterIcon />}
              size="small" variant="contained" target="_blank"
              href="https://racquetsappsuite.com/"
              sx={{
                borderRadius: '8px', minWidth: '125px', whiteSpace: 'nowrap', px: 2,
                bgcolor: BRAND.primary, color: BRAND.white, fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor: BRAND.white, color: BRAND.primary },
              }}
            > {t('detail.faqs')} </Button>
          </Stack>
        </Section>
      </Container>
    </>
  )
}
export default GetawayDetail;