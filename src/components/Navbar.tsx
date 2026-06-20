import * as React from 'react';
import { ROUTES } from '../constants/routes';
import GetawaysLogo from './GetawaysLogo/GetawaysLogo.jpg';
// import RcnetIcon from '../assets/RappsIcons/RCnet icon.png';
import playerIcon from '../assets/RappsIcons/PlayersProfile.png';

import {
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';
import {
  AppBar, Container, Box, Typography,
  Button, IconButton, Menu, MenuItem,
  Toolbar, Tooltip, Chip
} from '@mui/material';
import '../App.css';
// import Toolbar from '@mui/material/Toolbar';import Avatar from '@mui/material/Avatar';
// import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
// Toggle de tema deshabilitado temporalmente (se mantiene el modo claro por defecto)
// import Brightness4Icon from '@mui/icons-material/Brightness4';
// import Brightness7Icon from '@mui/icons-material/Brightness7';
// import { useColorMode } from '../theme/ColorModeContext';
import { BRAND } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
const pages = ['Login',
  // 'Sign up'
];
const settings = [
  // 'Profile', 'Account', 'Dashboard',
  'Logout'];

function NavBar() {
  // const { mode, toggleColorMode } = useColorMode(); // toggle de tema deshabilitado temporalmente
  const { user, role } = useAuth();
  const navigate = useNavigate();
  // Con sesión iniciada no se muestra "Login" en la navegación.
  const visiblePages = user ? pages.filter((p) => p !== 'Login') : pages;
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      await signOut(auth);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    //CustomAppBar
    <AppBar position="sticky" sx={{ backgroundColor: BRAND.primary }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* logo large */}
          <Typography
            variant="h6" component="a" noWrap href={ROUTES.LANDING}
            sx={{
              mr: 2, flexGrow: 8,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <img src={GetawaysLogo} style={{height:'36px'}} className="logo" alt="Getaways logo" />
          </Typography>

          {/* logo xs */}
          <Typography
            variant="h5" component="a" noWrap  href={ROUTES.LANDING}
            sx={{
              mr: 2,
              flexGrow: 8,
              display: { xs: 'flex', md: 'none' },
            }}
          >
            <img src={GetawaysLogo} style={{height:'32px'}} className="logo" alt="Getaways logo" />
          </Typography>

          <Box
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon/>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: {
                  xs: 'block',
                  md: 'none',
                  mt: '55px'
                },
              }}
            >
              {visiblePages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Button to={`/${page}`}
                    component={RouterLink}
                    aria-current="page"
                    sx={{ textTransform: 'none' }}
                  >
                    {page}
                  </Button>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {visiblePages.map((page) => (
              <Button
                component={RouterLink}
                onClick={handleCloseNavMenu}
                key={page} to={`/${page}`}
                aria-current="page" size="large"
                sx={{ my: 2, color: 'white', display: 'block', fontWeight: 'bold', textTransform: 'none' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          {/* Toggle de tema claro/oscuro deshabilitado temporalmente
          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={toggleColorMode} sx={{ color: BRAND.white, mr: 1 }}>
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
          */}

          {user && (
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                flexDirection: 'column',
                alignItems: 'flex-end',
                mr: 1.25,
                lineHeight: 1.1,
              }}
            >
              <Typography variant="body2" sx={{ color: BRAND.white, fontWeight: 'bold', lineHeight: 1.2 }}>
                {user.displayName || user.email}
              </Typography>
              <Chip
                label={role || 'user'}
                size="small"
                sx={{
                  height: 18,
                  mt: 0.25,
                  bgcolor: BRAND.lime,
                  color: BRAND.navy,
                  fontWeight: 'bold',
                  fontSize: '0.62rem',
                  textTransform: 'capitalize',
                  letterSpacing: 0.3,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            </Box>
          )}

          {user && (
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                {/* <img src={RcnetIcon} style={{height:'1.8em'}} className="logo" alt="Getaways logo" /> */}
                <img src={playerIcon} style={{height:'2.4em'}} className="logo" alt="Getaways logo" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '52px' }}
              id= "menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={setting === 'Logout' ? handleLogout : handleCloseUserMenu}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
);
}
const routes = [];
routes.push({
    to: ROUTES.LOGIN,
    id: 'login',
    text: 'Iniciar sesión',
    publicOnly: true,
    private: false,
  });
export default NavBar;