import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box, CircularProgress, List, ListItemButton, ListItemIcon, ListItemText, Tooltip,
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { ROUTES } from '../constants/routes';
import { Role } from '../constants/roles';
import { BRAND } from '../theme/colors';

interface SidebarItem {
  to: string;
  labelKey: string;
  icon: React.ReactNode;
  /** null = visible para cualquier rol. */
  roles: Role[] | null;
  /**
   * Rutas hijas que deben mantener la opción marcada. Sin esto, al entrar al
   * detalle de un getaway o a las reservas no queda ninguna opción resaltada y
   * pierdes la referencia de en qué sección estás.
   */
  childPaths?: string[];
}

const ITEMS: SidebarItem[] = [
  {
    to: ROUTES.GETAWAYS, labelKey: 'nav.getaways', icon: <SportsTennisIcon />, roles: null,
    childPaths: [ROUTES.GETAWAY_DETAIL, ROUTES.BOOKING],
  },
  { to: ROUTES.MY_ORDERS, labelKey: 'sidebar.myGetaways', icon: <ShoppingBagIcon />, roles: [Role.PLAYER] },
  {
    to: ROUTES.MY_GETAWAYS, labelKey: 'sidebar.myGetaways', icon: <NoteAltIcon />, roles: [Role.ADMIN],
    childPaths: [ROUTES.RESERVATIONS],
  },
  { to: ROUTES.CREATE_GETAWAY, labelKey: 'sidebar.newGetaway', icon: <AddIcon />, roles: [Role.ADMIN] },
  {
    to: ROUTES.COUPONS, labelKey: 'sidebar.coupons', icon: <LocalOfferIcon />, roles: [Role.ADMIN],
    // el propio prefijo cubre /coupons/new y /coupons/:id/edit
    childPaths: [ROUTES.COUPONS],
  },
];

/** Marcada si es la ruta exacta o si estamos en una de sus rutas hijas. */
const isItemActive = (item: SidebarItem, pathname: string): boolean =>
  pathname === item.to ||
  (item.childPaths ?? []).some((path) => pathname === path || pathname.startsWith(`${path}/`));

interface AdminSidebarProps {
  /** Modo icono: oculta las etiquetas y deja solo los iconos. */
  collapsed?: boolean;
  /** Se llama al navegar, para que el drawer móvil se cierre solo. */
  onNavigate?: () => void;
}

export default function AdminSideBar({ collapsed = false, onNavigate }: AdminSidebarProps) {
  const { t } = useTranslation();
  const { role, isLoading } = useAuth();
  const { pathname } = useLocation();
  const { locked } = useSidebar();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const visible = ITEMS.filter((item) => !item.roles || (role && item.roles.includes(role as Role)));

  return (
    <List sx={{ py: 1, px: collapsed ? 0.5 : 1 }}>
      {visible.map((item) => {
        const label = t(item.labelKey);
        const active = isItemActive(item, pathname);

        return (
          <Tooltip
            key={item.to}
            title={locked ? t('sidebar.lockedHint') : collapsed ? label : ''}
            placement="right"
          >
            <ListItemButton
              component={RouterLink}
              to={item.to}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              // Durante un cobro no se navega: salir dejaría la orden a medias.
              disabled={locked}
              sx={{
                mb: 1,
                // Durante un cobro no se navega: salir dejaría la orden a medias.
                pointerEvents: locked ? 'none' : undefined,
                opacity: locked ? 0.5 : 1,
                borderRadius: '8px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                px: collapsed ? 1 : 1.5,
                whiteSpace: 'nowrap',
                bgcolor: active ? BRAND.green : BRAND.primary,
                color: active ? BRAND.navy : BRAND.white,
                '& .MuiListItemIcon-root': { color: active ? BRAND.navy : BRAND.lime },
                ':hover': { bgcolor: active ? BRAND.green : BRAND.primaryDark },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 38, justifyContent: 'center' }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        );
      })}
    </List>
  );
}
