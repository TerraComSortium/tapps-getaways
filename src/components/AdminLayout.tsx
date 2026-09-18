import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, IconButton, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useSidebar } from '../contexts/SidebarContext';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import AdminSideBar from './AdminSidebar';
import { BRAND } from '../theme/colors';

const EXPANDED_WIDTH = 190;
const COLLAPSED_WIDTH = 64;
const STORAGE_KEY = 'sidebarCollapsed';
/** Alto del AppBar (sticky) — el sidebar se ancla justo debajo. */
const NAVBAR_HEIGHT = 64;

/**
 * Layout de las vistas con sidebar. Vive como ruta padre (`<Route element>`) para
 * que el sidebar se monte UNA vez: al navegar solo cambia el `<Outlet />`.
 *
 * - En escritorio es fijo y se pliega a modo icono (se recuerda en localStorage).
 * - En móvil es un Drawer que se abre con el botón de menú y se cierra al navegar.
 */
export default function AdminLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false; // modo privado o storage bloqueado
    }
  });
  // El botón que abre el drawer vive en el Navbar, así que el estado es compartido.
  const { mobileOpen, closeMobile, setHasSidebar } = useSidebar();

  // Se avisa al navbar de que esta ruta tiene sidebar, para que pinte el botón.
  useEffect(() => {
    setHasSidebar(true);
    return () => setHasSidebar(false);
  }, [setHasSidebar]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      /* si no se puede guardar, la preferencia solo dura la sesión */
    }
  }, [collapsed]);

  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box
      sx={{
        display: 'flex',
        // flex-start es necesario para que el sidebar sticky tenga recorrido; por
        // eso el <main> se estira aparte con alignSelf, si no el fondo de sección
        // solo cubriría la altura de su contenido.
        alignItems: 'flex-start',
        width: '100%',
        minHeight: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={closeMobile}
          // keepMounted: no se remonta al abrir y cerrar
          ModalProps={{ keepMounted: true }}
          slotProps={{
            paper: {
              sx: {
                width: EXPANDED_WIDTH, pt: 2,
                overflowY: 'auto', overscrollBehavior: 'contain',
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            },
          }}
        >
          <AdminSideBar onNavigate={closeMobile} />
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width, flexShrink: 0,
            // Misma superficie que el Drawer de móvil: sin esto, en escritorio el
            // sidebar quedaba transparente sobre el fondo de la página y no se
            // leía como un panel.
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            // Se queda anclado bajo el navbar: el contenido scrollea por debajo y
            // el menú no se va arriba del todo.
            position: 'sticky',
            top: NAVBAR_HEIGHT,
            alignSelf: 'flex-start',
            height: `calc(100dvh - ${NAVBAR_HEIGHT}px)`,
            display: 'flex',
            flexDirection: 'column',
            pt: 2,
            transition: theme.transitions.create('width', { duration: theme.transitions.duration.shorter }),
          }}
        >
          {/* Área que scrollea: si el menú crece más que la pantalla, la barra
              aparece aquí y no arrastra la página. */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              // al llegar al final del menú, el scroll NO continúa en la página
              overscrollBehavior: 'contain',
              // barra fina con el color de marca, en vez de la del sistema
              scrollbarWidth: 'thin',
              scrollbarColor: `${BRAND.primary} transparent`,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: BRAND.primary,
                borderRadius: 3,
              },
            }}
          >
            <AdminSideBar collapsed={collapsed} />
          </Box>
          {/* El botón de plegar queda fijo abajo, fuera del área que scrollea */}
          {/* pb generoso: lo separa del borde inferior de la pantalla */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: collapsed ? 'center' : 'flex-end',
              px: 1, pt: 1, pb: 5,
            }}
          >
            <Tooltip
              title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
              placement="right"
            >
              <IconButton
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: BRAND.green,
                  color: BRAND.primary,
                  boxShadow: 2,
                  transition: theme.transitions.create(
                    ['background-color', 'color', 'transform'],
                    { duration: theme.transitions.duration.shortest }
                  ),
                  ':hover': {
                    bgcolor: BRAND.primary,
                    color: BRAND.green,
                    transform: 'scale(1.08)',
                  },
                  // el foco por teclado también tiene que verse
                  ':focus-visible': {
                    outline: `2px solid ${BRAND.primary}`,
                    outlineOffset: 2,
                  },
                }}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Box
        component="main"
        className="section blueBg"
        sx={{ flexGrow: 1, minWidth: 0, alignSelf: 'stretch' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
