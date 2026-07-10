import { Box, Button, Typography, Card, CardContent, CardMedia, List, ListItemText} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { ROUTES } from '../constants/routes';
import { BRAND } from '../theme/colors';
// import GetawaysLogo from '../components/GetawaysLogo/GetawaysLogo.jpg';
import background1 from '../assets/backgrounds/tenis.jpg';
import clubView1 from '../assets/backgrounds/clubView1.png';
import '../App.css';
import '../index.css';
import SearchBar from '../components/SearchBar';
import MainMap from '../components/MainMap';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: '100%', overflowX: 'hidden' }}>
      <Box sx={{ width: '100%', position: 'relative', minHeight: { xs: 260, sm: 'auto' } }}>
        <Box sx={{ width: '100%', height: 'auto', overflow: 'hidden' }}>
          <img alt="tennis player" src={background1}
            style={{
              display: 'block', width: '100%', height: 'auto',
              objectFit: 'cover', objectPosition: 'top',
              clipPath: 'inset(40px 0px)',
              transform: 'translateY(-40px)'
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex', justifyContent: 'center', position: 'absolute',
            top: 0, left: 0, right: 0, zIndex: 10, pt: 3,
            px: { xs: 1, sm: 2, md: 4 },
            boxSizing: 'border-box',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)'
          }}
        >
          <SearchBar />
        </Box>
      </Box>

      <Box className='section'
      sx={{
        height: 'auto', display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: { xs: 4, sm: 6 }
      }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid size={{ xs: 12}} sx={{ height: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: "column",
            py: { xs: 4, sm: 0 },
            px: { xs: 2, sm: 6, md: '10vh' }
          }}>
            <Typography variant="h5" className='title' sx={{
              mb: { xs:3, sm:'30px'},
              mt: { xs:12, sm:'0px', md:'2vh' },
              fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' },
              textAlign: 'center'
            }}>{t('landing.popularDestinations')} </Typography>
            <Grid container className='cards'
              spacing={3}
              justifyContent="center" sx={{ maxWidth: '1200px', width: '100%' }}>
                <Grid className='card1' size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card sx={{ width: { xs: '100%', sm: 260, md: 285 }, maxWidth: 285, minWidth:240, margin: '0 auto' }}>
                    <CardMedia
                      sx={{ height: 160 }}
                      image={clubView1}
                      title="getaway 1"
                    />
                    <CardContent className='purpBtn2'>
                      <Typography gutterBottom variant="body2" component="div" sx={{ textAlign: 'center', height:10 }}>
                        Cañaveral Country Club
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid className='card1' size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card sx={{ width: { xs: '100%', sm: 260 }, maxWidth: 285, minWidth:240, margin: '0 auto' }}>
                    <CardMedia
                      sx={{ height: 160 }}
                      image={clubView1}
                      title="getaway 2"
                    />
                    <CardContent className='purpBtn2'>
                      <Typography gutterBottom variant="body2" component="div" sx={{ textAlign: 'center', height:10 }}>
                        Cañaveral Country Club
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid className='card1' size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Card sx={{ width: { xs: '100%', sm: 260 }, maxWidth: 285, minWidth:240, margin: '0 auto' }}>
                    <CardMedia
                      sx={{ height: 160 }}
                      image={clubView1}
                      title="getaway 3"
                    />
                    <CardContent className='purpBtn2'>
                      <Typography gutterBottom variant="body2" component="div" sx={{ textAlign: 'center', height:10 }}>
                        Hato Grande Club
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box className='blueBg rcnets' sx={{ textAlign: 'center' }}>
        <section className='section'>
          <Typography variant="h5" className='title3' sx={{fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem' }}}>
          {t('landing.rcnetsOffering')}
          </Typography>
          <p> {t('landing.joinUs')} </p>
        </section>
        <Grid
          // container
          direction="row" justifyContent="center" alignItems="center" spacing={1}>
          {/* <Grid size={{ xs: 3, sm: 2 }}>
            <img src={GetawaysLogo} style={{ height: '30px', maxWidth: '100%', objectFit: 'contain' }} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs: 3, sm: 2 }}>
            <img src={GetawaysLogo} style={{ height: '30px', maxWidth: '100%', objectFit: 'contain' }} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs: 3, sm: 2 }}>
            <img src={GetawaysLogo} style={{ height: '30px', maxWidth: '100%', objectFit: 'contain' }} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs: 3, sm: 2 }}>
            <img src={GetawaysLogo} style={{ height: '30px', maxWidth: '100%', objectFit: 'contain' }} className="logo" alt="Club Logo" />
          </Grid> */}
        </Grid>
      </Box>
      <Box
        sx={{ height: { xs: 'auto', md: '70vh', mb: { xs: 4, md: 0 } }}}>
        <Grid container direction="row"
          // rowSpacing={1}
          alignItems="center" justifyContent="center">
          <Grid size={{ xs: 12, md: 5 }}  sx={{ display:'flex', flexDirection:"column",
            justifyContent:'center', alignItems: 'start',
            px: { xs: 3, md: '10vh' },
            mt: { xs: 3, md: '5vh' }
            // pl:'10vh', pr:'10vh', mt:'5vh'
          }}>
            <Typography variant="h5" sx={{fontWeight: 'semibold', color:BRAND.primary, fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.8rem'}}}>
              {t('landing.nearbyDestinations')}
            </Typography>
            <List>
              <ListItemText primary={t('landing.nearby1')}/>
              <ListItemText primary={t('landing.nearby2')}/>
              <ListItemText primary={t('landing.nearby3')}/>
              <ListItemText primary={t('landing.nearby4')}/>
            </List>
            <Typography variant="body1" className='label' sx={{ mt: 2, fontWeight: 'semibold' }}>
              {t('landing.signInExplore')}
            </Typography>
            <Button href={ROUTES.LOGIN} type="submit" variant="contained" disableElevation
              sx={{ mt: 2, mb: 5, bgcolor: BRAND.lime, color: BRAND.navy, fontWeight: 'bold', borderRadius: '30px' }}
            >{t('landing.exploreGetaways')}</Button>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ height: { xs: 300, md: '70vh' }, width: '100%' }}>
              <MainMap />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box className='benefitsSection'>
        <Typography variant="h5" className='title2' sx={{ color: BRAND.white, mb:2 }}>{t('landing.discoverBenefits')}</Typography>
        <section className='benefits'>
          <Box sx={{ width: { xs: '100%', sm: '45%', md: '40%' }, maxWidth: '400px' }}>
            <Card variant="outlined"
              className='benefitsCards2'
              sx={{ border: `solid 0.25em ${BRAND.green}`, borderRadius: '15px' }}>
              <CardContent sx={{bgcolor: BRAND.bgPaper, mt:'2vh'}}>
                <Typography variant="h5"> {t('landing.benefitsPlayers')} </Typography>
                <List sx={{pl:'3vh', pr:'3vh'}}>
                  <ListItemText primary={t('landing.playersB1')}/>
                  <ListItemText primary={t('landing.playersB2')}/>
                  <ListItemText primary={t('landing.playersB3')}/>
                  <ListItemText primary={t('landing.appSuiteBenefit')}/>
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button  href={ROUTES.GETAWAYS}
                    sx={{ m:2, padding: '5px 20px', bgcolor: BRAND.lime, color: BRAND.navy, fontWeight: 'semibold', borderRadius: '12px', textTransform: 'none' }}
                  >{t('landing.discoverGetawaysBtn')}</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: '45%', md: '40%' }, maxWidth: '400px' }}>
            <Card variant="outlined" className='benefitsCards2' sx={{ border: `solid 0.25em ${BRAND.lime}`, borderRadius: '15px' }}>
              <CardContent sx={{bgcolor: BRAND.bgPaper, mt:'2vh'}}>
                <Typography variant="h5">{t('landing.benefitsRcnets')}</Typography>
                <List sx={{pl:'3vh', pr:'3vh'}}>
                  <ListItemText primary={t('landing.rcnetsB1')}/>
                  <ListItemText primary={t('landing.rcnetsB2')}/>
                  <ListItemText primary={t('landing.rcnetsB3')}/>
                  <ListItemText primary={t('landing.appSuiteBenefit')}/>
                </List>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button  href={ROUTES.LOGIN}
                    sx={{ m:2, padding: '5px 20px', bgcolor: BRAND.green, color: BRAND.navy, fontWeight: 'semibold', borderRadius: '12px', textTransform: 'none' }}
                  >{t('landing.offerGetawaysBtn')}</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </section>
      </Box>
    </Box>
  );
};
export default LandingPage;