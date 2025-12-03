import { Box, Button, Typography, Card, CardContent, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid2';

import GetawaysLogo from '../components/GetawaysLogo/GetawaysLogo.jpg';
import background1 from '../assets/backgrounds/tenis.jpg';
import mapSample from '../assets/backgrounds/mapSample.png';
import clubView1 from '../assets/backgrounds/clubView1.png';
import '../App.css';
import '../index.css';
import SearchBar from '../components/SearchBar';
const LandingPage = () => {
  return (
    <>
      <Box sx={{ width: '100%', height: 'auto', position: 'relative', overflow: 'hidden' }} >
        <Box
          sx={{
            display: 'flex', justifyContent: 'center', position: 'absolute',
            top:  0, left: 0, right: 0, zIndex: 10, pt: 3,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)'
          }}
        ><SearchBar/>
        </Box>

        <img alt="tennis player" src={background1}
          style={{
            display: 'block', width: '100%', height: 'auto%',
            objectFit: 'cover', objectPosition: 'top',
            clipPath: 'inset( 40px 0px)',
            transform: 'translateY(-40px)'
          }}
        />
      </Box>

      <section className='section'>
        <h2 className='title'>
          {/* Destinos más populares en Los Angeles */}
          Most popular destinations in Los Angeles
        </h2>
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
                  {/*rcnetName */}
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
      <center className='blueBg rcnets'>
        <section className='section '>
          <h2 className='title'>
            {/* RCnets ofreciendo Getaways Tours&trade; */}
            RCnets offering Getaways Tours&trade;
          </h2>
          <p>
            {/* ¡Únete y disfruta de beneficios exclusivos!  */}
            Join us and enjoy exclusive benefits!
          </p>
        </section>
        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
          <Grid size={{ xs:2 }}>
            <img src={GetawaysLogo} style={{height:'36px'}} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs:2 }}>
            <img src={GetawaysLogo} style={{height:'36px'}} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs:2 }}>
            <img src={GetawaysLogo} style={{height:'36px'}} className="logo" alt="Club Logo" />
          </Grid>
          <Grid size={{ xs:2 }}>
            <img src={GetawaysLogo} style={{height:'36px'}} className="logo" alt="Club Logo" />
          </Grid>
        </Grid>
      </center>
      <section className='section blueBg' >
        <h2 className='title'>
          {/* Destinos cercanos en tu zona */}
          Nearby destinations in your area
        </h2>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid>
            <section className='section'>
              <ul>
                <li>
                  Find the best Racquets!&trade; destinations in your area
                  {/* Encuentra los mejores destinos de racquets en tu zona */}
                </li>
                <li>
                  Get access to high-quality clubs
                  {/* Accede a clubes de alta calidad */}
                </li>
                <li>
                  Take part in exclusive events
                  {/* Participa en eventos exclusivos */}
                </li>
                <li>
                  Enjoy unique benefits
                  {/* Disfruta de beneficios únicos */}
                </li>
                <br/>
                <p className='label'>
                  Sign in and explore incredible packages!
                  {/* ¡Regístrate y explora paquetes increíbles! */}
                </p>

                <Button type="submit" variant="contained" disableElevation
                  sx={{ mt: 2, mb: 5, bgcolor: '#C9F305', color: '#1A2660', fontWeight: 'bold',  borderRadius:'30px' }}
                > Explore Getaways
                  {/* Acceder */}
                </Button>
              </ul>
            </section>
          </Grid>
          <Grid size={{ xs:6 }}>
            <section>
              <img src={mapSample} style={{maxHeight:'400px'}} className="logo" alt="locations sample" />
            </section>
          </Grid>
        </Grid>
      </section>
      <Box className='benefitsSection'>
        <h2 className='title2'>
          {/* Descubre todos los beneficios que puedes tener */}
          Discover all the benefits you can enjoy
        </h2>
        <section className='benefits'>
          <Box sx={{ minWidth: 450 }}>
            <Card variant="outlined"
              className='benefitsCards2'
              sx={{ border: 'solid 0.25em #00E392',
                borderRadius: '15px',
              }}>
              <CardContent sx={{ bgcolor: '#fff' }}>
                <Typography variant="h5">
                  {/* Beneficios para jugadores y turistas */}
                  Benefits for players
                </Typography>
                <Typography variant="body2">
                  <ul>
                    <li>
                      {/* Accede a la d/TC turística de tu preferencia para disfrutar tu estadía */}
                      Access the Getaway&trade; offer of your choice to enjoy your stay.
                    </li>
                    <li>
                      {/* Explora diversas ofertas cercanas a ti */}
                      Explore various offers near you
                    </li>
                    <li>
                      {/* Selecciona el Getaway que mejor se adapte a tu presupuesto */}
                      Select the Getaway that best suits your budget
                    </li>
                    <li>
                      {/* Mejora tu experiencia de viaje usando nuestras aplicaciones Racquets! AppSuite&trade; */}
                      Enhance your travel experience by using our Racquets! AppSuite&trade; applications
                    </li>
                  </ul>
                </Typography>
                <center>
                  <Button
                    sx={{ mb: 1, padding: '5px 15px', bgcolor: '#C9F305', color: '#1A2660', fontWeight: 'bold', borderRadius:'30px', textTransform: 'none', justifyContent: "center" }}
                  > Explore Getaways&trade;
                    {/* Ver paquetes */}
                  </Button>
                </center>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Card variant="outlined"
              className='benefitsCards2'
              sx={{ border: 'solid 0.25em #C9F305', borderRadius: '15px',
              }}>
              <CardContent sx={{ bgcolor: '#fff' }}>
                <Typography variant="h5">
                  {/* Beneficios para RCnets */}
                  Benefits for RCnets
                </Typography>
                <Typography variant="body2" component="div">
                  <ul>
                    <li>
                      {/* Oferta tus mejores planes para conectar con jugadores en su geografía local */}
                      Offer your best plans to connect with players in their local area.
                    </li>
                    <li>
                      {/* Logra un incremento exponencial en la participación de jugadores/turistas en tu d/TC */}
                      Achieve an exponential increase in player/tourist participation
                    </li>
                    <li>
                      {/* Personaliza tus ofertas dentro de la plataforma Racquets! Getaways&trade; */}
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