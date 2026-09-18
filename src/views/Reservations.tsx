import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent,
  Divider, Stack, CircularProgress, Link, Chip, TextField, InputAdornment,
  ToggleButton, ToggleButtonGroup, Alert
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { styled } from '@mui/material/styles';
import { BRAND } from '../theme/colors';
import { useGetawaySubscribers } from '../hooks/useGetawaySubscribers';
import { useInvoice } from '../hooks/useInvoice';
import type { GetawayOrder } from '../types/getaway';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

/** Fila etiqueta → valor del detalle; el valor se alinea a la derecha. */
const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <Stack
    direction="row" spacing={2}
    sx={{ justifyContent: 'space-between', alignItems: 'baseline', py: 0.4 }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>
      {value || '—'}
    </Typography>
  </Stack>
);

const DetailSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box sx={{ mt: 2 }}>
    <Typography
      variant="overline"
      sx={{ color: BRAND.primary, fontWeight: 'bold', letterSpacing: 0.6 }}
    >
      {title}
    </Typography>
    <Divider sx={{ mb: 1 }} />
    {children}
  </Box>
);

type PaymentFilter = 'all' | 'paid' | 'unpaid';

/** Una orden cuenta como pagada cuando el backend la marcó así al confirmar el cobro. */
const isPaid = (order: GetawayOrder): boolean =>
  order.status === 'paid' || order.paymentStatus === 'succeeded';

const formatDate = (value?: string): string => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

/** wa.me solo acepta dígitos: se limpian espacios, guiones, paréntesis y el '+'. */
const whatsappHref = (cellphone?: string): string | null => {
  const digits = (cellphone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};

/** Referencia legible: nº de factura si ya se pagó, si no el orderId acortado. */
const orderReference = (order: GetawayOrder): string =>
  order.invoiceNumber || `#${(order.orderId || order.id || '').slice(0, 8)}`;

export const Reservations = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: orders, loading, error, refetch } = useGetawaySubscribers(id || '');
  const { download, loading: downloadingInvoice } = useInvoice();

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GetawayOrder | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [search, setSearch] = useState('');

  const paidCount = useMemo(() => orders.filter(isPaid).length, [orders]);

  const visibleOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (paymentFilter === 'paid' && !isPaid(order)) return false;
      if (paymentFilter === 'unpaid' && isPaid(order)) return false;
      if (!term) return true;

      const user = order.reservation?.user;
      return [
        user?.name,
        user?.email,
        user?.cellphone,
        order.invoiceNumber,
        order.orderId,
        order.reservation?.lodgingOption?.option,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [orders, paymentFilter, search]);

  const handleOpenDialog = (order: GetawayOrder) => {
    setSelectedRow(order);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedRow(null);
  };

  const selectedReservation = selectedRow?.reservation;

  return (
    <>
            <Box>
        <Typography variant="h6">{t('reservations.assistantsList')}</Typography>

        {orders.length > 0 && (
          <Typography sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            {t('reservations.ordersCount', { count: orders.length, paid: paidCount })}
          </Typography>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filtro por estado de pago + buscador */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 2, alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <ToggleButtonGroup
            exclusive size="small" value={paymentFilter}
            onChange={(_, value: PaymentFilter | null) => value && setPaymentFilter(value)}
            sx={{
              bgcolor: 'background.paper',
              '& .MuiToggleButton-root.Mui-selected': {
                bgcolor: BRAND.primary, color: BRAND.white,
                '&:hover': { bgcolor: BRAND.primaryDark },
              },
            }}
          >
            <ToggleButton value="all" sx={{ textTransform: 'none', px: 2 }}>
              {t('reservations.filterAll')}
            </ToggleButton>
            <ToggleButton value="paid" sx={{ textTransform: 'none', px: 2 }}>
              {t('reservations.filterPaid')}
            </ToggleButton>
            <ToggleButton value="unpaid" sx={{ textTransform: 'none', px: 2 }}>
              {t('reservations.filterUnpaid')}
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField
            size="small" value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('reservations.searchPlaceholder')}
            sx={{ bgcolor: 'background.paper', borderRadius: 1, minWidth: { sm: 280 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Empuja el refresh al extremo derecho de la barra */}
          <Box sx={{ flexGrow: 1 }} />

          <Button disableElevation size="small"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
            onClick={refetch}
            sx={{
              minWidth: 115, whiteSpace: 'nowrap', px: 2, alignSelf: { xs: 'flex-end', sm: 'center' }, flexShrink: 0,
              borderRadius: '18px',
              bgcolor: BRAND.primary, color: BRAND.white, fontVariantCaps: 'normal', textTransform: 'none',
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
            }}
          > {loading ? t('reservations.refreshing') : t('reservations.refresh')} </Button>
        </Stack>

        {loading ? (
          <Box sx={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', minHeight: '250px',
            bgcolor: 'background.paper', borderRadius: '12px'
          }}>
            <CircularProgress size={36} sx={{ color: BRAND.primary, mb: 2 }} />
            <Typography variant="body2" color="text.secondary">{t('reservations.fetchingBookings')}</Typography>
          </Box>
        ) : visibleOrders.length === 0 ? (
          <Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '200px', bgcolor: 'background.paper', borderRadius: '12px'
          }}>
            <Typography variant="body2" color="text.secondary">
              {orders.length === 0 ? t('reservations.noSubscribers') : t('reservations.noMatches')}
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 820 }} aria-label="orders table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">{t('reservations.reference')}</StyledTableCell>
                  <StyledTableCell>{t('reservations.playerName')}</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.date')}</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.paymentState')}</StyledTableCell>
                  <StyledTableCell align="right">{t('reservations.amount')}</StyledTableCell>
                  <StyledTableCell align="left">{t('reservations.contact')}</StyledTableCell>
                  <StyledTableCell align="center">{t('reservations.saleDetail')}</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleOrders.map((order) => {
                  const user = order.reservation?.user;
                  const paid = isPaid(order);
                  const waLink = whatsappHref(user?.cellphone);

                  return (
                    <StyledTableRow key={order.id || order.orderId}>
                      <StyledTableCell align="left">{orderReference(order)}</StyledTableCell>

                      <StyledTableCell component="th" scope="row">
                        <Stack direction="column" spacing={0.3}>
                          <strong>{user?.name || t('common.noData')}</strong>
                          {user?.email && (
                            <Link href={`mailto:${user.email}`} variant="caption" underline="hover">
                              {user.email}
                            </Link>
                          )}
                        </Stack>
                      </StyledTableCell>

                      <StyledTableCell align="left">{formatDate(order.createdAt)}</StyledTableCell>

                      <StyledTableCell align="left">
                        <Chip size="small"
                          label={paid ? t('reservations.paid') : t('reservations.unpaid')}
                          sx={{
                            fontWeight: 'bold',
                            bgcolor: paid ? BRAND.green : 'warning.light',
                            color: paid ? BRAND.navy : 'warning.contrastText',
                          }}
                        />
                      </StyledTableCell>

                      <StyledTableCell align="right">
                        {order.reservation?.paymentDetails?.Total ?? '—'}
                      </StyledTableCell>

                      <StyledTableCell align="left">
                        {waLink ? (
                          <Link target="_blank" rel="noopener" href={waLink}>
                            {user?.cellphone}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <Button startIcon={<CreditCardIcon />}
                          onClick={() => handleOpenDialog(order)}
                          sx={{
                            minWidth: 136, whiteSpace: 'nowrap', px: 2, bgcolor: BRAND.primary, color: BRAND.white,
                            fontWeight: 'medium', textTransform: 'none', borderRadius: '8px',
                          }}
                        > {t('reservations.saleDetails')} </Button>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    

      {/* Detalle de la orden: todo sale de la fila seleccionada */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {/* component="span": DialogTitle ya es un <h2> y subtitle1 renderiza <h6>
              por defecto, lo que anida un encabezado dentro de otro. */}
          <Typography
            variant="subtitle1" component="span"
            sx={{ display: 'block', textAlign: 'center' }}
          >
            {t('reservations.saleDetails')}
          </Typography>
          <IconButton aria-label="close" onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          ><CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <>
              {/* Cabecera: referencia + estado */}
              <Stack
                direction="row" spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
                  {orderReference(selectedRow)}
                </Typography>
                <Chip size="small"
                  label={isPaid(selectedRow) ? t('reservations.paid') : t('reservations.unpaid')}
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: isPaid(selectedRow) ? BRAND.green : 'warning.light',
                    color: isPaid(selectedRow) ? BRAND.navy : 'warning.contrastText',
                  }}
                />
              </Stack>

              <DetailSection title={t('reservations.customer')}>
                <DetailRow label={t('reservations.playerName')} value={selectedReservation?.user?.name} />
                <DetailRow
                  label={t('book.email')}
                  value={selectedReservation?.user?.email && (
                    <Link href={`mailto:${selectedReservation.user.email}`} underline="hover">
                      {selectedReservation.user.email}
                    </Link>
                  )}
                />
                <DetailRow
                  label={t('book.cellphone')}
                  value={whatsappHref(selectedReservation?.user?.cellphone) && (
                    <Link
                      href={whatsappHref(selectedReservation?.user?.cellphone) as string}
                      target="_blank" rel="noopener" underline="hover"
                    >
                      {selectedReservation?.user?.cellphone}
                    </Link>
                  )}
                />
                {selectedReservation?.user?.address && (
                  <DetailRow
                    label={t('book.address')}
                    value={[
                      selectedReservation.user.address.street,
                      selectedReservation.user.address.city,
                      selectedReservation.user.address.state,
                      selectedReservation.user.address.zipCode,
                      selectedReservation.user.address.country,
                    ].filter(Boolean).join(', ')}
                  />
                )}
              </DetailSection>

              <DetailSection title={t('reservations.bookingDetails')}>
                <DetailRow
                  label={t('reservations.lodgingOption')}
                  value={selectedReservation?.lodgingOption?.option}
                />
                {selectedReservation?.lodgingOption?.price != null && (
                  <DetailRow
                    label={t('reservations.price')}
                    value={`$${selectedReservation.lodgingOption.price}`}
                  />
                )}
                {selectedReservation?.lodgingOption?.occupancy && (
                  <DetailRow
                    label={t('reservations.occupancy')}
                    value={selectedReservation.lodgingOption.occupancy}
                  />
                )}

                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">{t('reservations.addOns')}</Typography>
                  {selectedReservation?.optionalAddOns?.length ? (
                    selectedReservation.optionalAddOns.map((addOn, index) => (
                      <DetailRow
                        key={`${addOn.addonName}-${index}`}
                        label={addOn.addonName}
                        value={`$${addOn.price}`}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{t('payment.none')}</Typography>
                  )}
                </Box>

                {selectedReservation?.couponId && (
                  <DetailRow label={t('reservations.coupon')} value={selectedReservation.couponId} />
                )}
              </DetailSection>

              <DetailSection title={t('reservations.paymentDetails')}>
                <DetailRow label={t('book.subtotal')} value={selectedReservation?.paymentDetails?.Subtotal} />
                <DetailRow label={t('reservations.taxes')} value={selectedReservation?.paymentDetails?.Taxes} />
                <Divider sx={{ my: 0.5 }} />
                <Stack
                  direction="row" spacing={2}
                  sx={{ justifyContent: 'space-between', alignItems: 'baseline', py: 0.4 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t('reservations.total')}</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: BRAND.primary }}>
                    {selectedReservation?.paymentDetails?.Total || '—'}
                  </Typography>
                </Stack>
              </DetailSection>

              <DetailSection title={t('reservations.orderInfo')}>
                <DetailRow label={t('reservations.date')} value={formatDate(selectedRow.createdAt)} />
                {selectedRow.paidAt && (
                  <DetailRow label={t('reservations.paidOn')} value={formatDate(selectedRow.paidAt)} />
                )}
                <DetailRow label={t('paid.orderId')} value={selectedRow.orderId || selectedRow.id} />
                {selectedRow.invoiceNumber && (
                  <DetailRow label={t('reservations.invoice')} value={selectedRow.invoiceNumber} />
                )}
                {selectedRow.paymentIntentId && (
                  <DetailRow label={t('reservations.paymentRef')} value={selectedRow.paymentIntentId} />
                )}
                {selectedRow.paymentStatus && (
                  <DetailRow label={t('reservations.paymentState')} value={selectedRow.paymentStatus} />
                )}
              </DetailSection>

              {isPaid(selectedRow) && (
                <Button fullWidth
                  startIcon={downloadingInvoice ? <CircularProgress size={16} color="inherit" /> : <ReceiptLongIcon />}
                  onClick={() => download(selectedRow.orderId || selectedRow.id)}
                  disabled={downloadingInvoice}
                  sx={{
                    mt: 3, py: 1, borderRadius: '8px', textTransform: 'none',
                    bgcolor: BRAND.primary, color: BRAND.white,
                    ':hover': { bgcolor: BRAND.primaryDark },
                    '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
                  }}
                > {t('reservations.downloadInvoice')} </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
