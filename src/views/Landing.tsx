import { Box, Button, Typography, Card, CardContent, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid2';

import GetawaysLogo from '../components/GetawaysLogo/GetawaysLogo.jpg';
import background1 from '../assets/backgrounds/tenis.jpg';
import clubView1 from '../assets/backgrounds/clubView1.png';
import '../App.css';
import '../index.css';
import SearchBar from '../components/SearchBar';
import MainMap from '../components/MainMap';


const LandingPage = () => {
  return (
    <>
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

      <section className='section'>
        <Typography variant="h5" className='title'>
          Most popular destinations in Los Angeles
        </Typography>
        <div className='cards'>
          <div className='card1'>
            <Card sx={{ width: 250, margin: '0 20px' }}>
              <CardMedia
                sx={{ height: 150 }}
                image={clubView1}
                title="getaway 1"
              />
              <CardContent className='purpBtn2'>
                <Typography gutterBottom variant="body2" component="div">
                  Cañaveral Country Club
                </Typography>
              </CardContent>
            </Card>
          </div>
          <div className='card1'>
            <Card sx={{ width: 250, margin: '0 20px' }}>
              <CardMedia
                sx={{ height: 150 }}
                image={clubView1}
                title="getaway 2"
              />
              <CardContent className='purpBtn2'>
                <Typography gutterBottom variant="body2" component="div">
                  Cañaveral Country Club
                </Typography>
              </CardContent>
            </Card>
          </div>
          <div className='card1'>
            <Card sx={{ width: 250, margin: '0 20px' }}>
              <CardMedia
                sx={{ height: 150 }}
                image={clubView1}
                title="getaway 3"
              />
              <CardContent className='purpBtn2'>
                <Typography gutterBottom variant="body2" className='purpBtn2' component="div">
                  Hato Grande Club
                </Typography>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Box className='blueBg rcnets' sx={{ textAlign: 'center' }}>
        <section className='section'>
          <Typography variant="h5" className='title'>
            RCnets offering Getaways Tours&trade;
          </Typography>
          <Typography variant="body1">
            Join us and enjoy exclusive benefits!
          </Typography>
        </section>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={1}>
          <Grid size={{ xs: 3, sm: 2 }}>
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
          </Grid>
        </Grid>
      </Box>

      <section className='section blueBg'>
        <Typography variant="h5" className='title'>
          Nearby destinations in your area
        </Typography>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <section className='section'>
              <ul>
                <li>
                  Find the best Racquets!&trade; destinations in your area
                </li>
                <li>
                  Get access to high-quality clubs
                </li>
                <li>
                  Take part in exclusive events
                </li>
                <li>
                  Enjoy unique benefits
                </li>
              </ul>
              <Typography variant="body1" className='label' sx={{ mt: 2 }}>
                Sign in and explore incredible packages!
              </Typography>
              <Button type="submit" variant="contained" disableElevation
                sx={{ mt: 2, mb: 5, bgcolor: '#C9F305', color: '#1A2660', fontWeight: 'bold', borderRadius: '30px' }}
              >Explore Getaways</Button>
            </section>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ height: { xs: 350, md: '70vh' }, width: '100%' }}>
              <MainMap />
            </Box>
          </Grid>
        </Grid>
      </section>

      <Box className='benefitsSection'>
        <Typography variant="h5" className='title2'>
          Discover all the benefits you can enjoy
        </Typography>
        <section className='benefits'>
          <Box sx={{ minWidth: { xs: 0, md: 380 }, width: { xs: '100%', md: 'auto' } }}>
            <Card variant="outlined"
              className='benefitsCards2'
              sx={{ border: 'solid 0.25em #00E392', borderRadius: '15px' }}>
              <CardContent sx={{ bgcolor: '#fff' }}>
                <Typography variant="h5">
                  Benefits for players
                </Typography>
                <Typography variant="body2" component="div">
                  <ul>
                    <li>
                      Access the Getaway&trade; offer of your choice to enjoy your stay.
                    </li>
                    <li>
                      Explore various offers near you
                    </li>
                    <li>
                      Select the Getaway that best suits your budget
                    </li>
                    <li>
                      Enhance your travel experience by using our Racquets! AppSuite&trade; applications
                    </li>
                  </ul>
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    sx={{ mb: 1, padding: '5px 15px', bgcolor: '#C9F305', color: '#1A2660', fontWeight: 'bold', borderRadius: '30px', textTransform: 'none' }}
                  >Explore Getaways&trade;</Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ minWidth: { xs: 0, md: 200 }, width: { xs: '100%', md: 'auto' } }}>
            <Card variant="outlined"
              className='benefitsCards2'
              sx={{ border: 'solid 0.25em #C9F305', borderRadius: '15px' }}>
              <CardContent sx={{ bgcolor: '#fff' }}>
                <Typography variant="h5">
                  Benefits for RCnets
                </Typography>
                <Typography variant="body2" component="div">
                  <ul>
                    <li>
                      Offer your best plans to connect with players in their local area.
                    </li>
                    <li>
                      Achieve an exponential increase in player/tourist participation
                    </li>
                    <li>
                      Customize your offers within the Racquets! Getaways&trade; platform
                    </li>
                  </ul>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </section>
      </Box>
    </>
  );
};
export default LandingPage;
