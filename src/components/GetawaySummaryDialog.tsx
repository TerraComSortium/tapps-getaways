import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../theme/colors';

/** Línea con precio por día (alojamiento o servicio incluido). */
export interface SummaryPricedLine {
  name: string;
  unitPrice: number;
  days: number;
  total: number;
}

export interface GetawaySummary {
  title: string;
  startDate: string;
  endDate: string;
  days: number;
  sport: string;
  address: string;
  lodging: SummaryPricedLine[];
  amenities: SummaryPricedLine[];
  addOns: { name: string; price: number }[];
  /** Academia + torneos + ladders seleccionados, cada uno con su tarifa. */
  activities: { name: string; kind: 'academy' | 'tournament' | 'ladder'; price: number }[];
  /** Actividades cargadas en el calendario del getaway. */
  scheduleCount: number;
}

interface GetawaySummaryDialogProps {
  open: boolean;
  summary: GetawaySummary | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Resumen antes de guardar un getaway: todo lo cargado y el precio real.
 *
 * Precio del getaway = habitación + actividades incluidas + servicios incluidos
 * (sin add-ons, que son opcionales, ni impuestos). Es el mismo cálculo que hace
 * el backend para el "Desde $X" y para el cobro, así que coincide con lo que
 * verá el cliente con la habitación más barata.
 */
export function GetawaySummaryDialog({ open, summary, saving, onClose, onConfirm }: GetawaySummaryDialogProps) {
  const { t, i18n } = useTranslation();
  if (!summary) return null;

  const money = (value: number) =>
    `$${value.toLocaleString(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const dateFormatter = new Intl.DateTimeFormat(i18n.language, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const formatDate = (iso: string) => {
    const time = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
    return Number.isNaN(time) ? iso : dateFormatter.format(time);
  };

  const amenitiesTotal = summary.amenities.reduce((sum, line) => sum + line.total, 0);
  const activitiesTotal = Math.round(summary.activities.reduce((sum, line) => sum + line.price, 0) * 100) / 100;
  const getawayValue = activitiesTotal + amenitiesTotal;
  const lodgingTotals = summary.lodging.map((line) => line.total);
  const priceFrom = (lodgingTotals.length ? Math.min(...lodgingTotals) : 0) + getawayValue;
  const priceTo = (lodgingTotals.length ? Math.max(...lodgingTotals) : 0) + getawayValue;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ color: BRAND.primary, fontWeight: 'bold', letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Box>
  );
  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, py: 0.25 }}>
      <Typography variant="body2" sx={{ fontWeight: strong ? 'bold' : 'normal', minWidth: 0 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: strong ? 'bold' : 'normal', flexShrink: 0 }}>{value}</Typography>
    </Stack>
  );
  const PricedLines = ({ lines }: { lines: SummaryPricedLine[] }) => (
    <>
      {lines.map((line, index) => (
        <Row
          key={`${line.name}-${index}`}
          label={`${line.name} · ${money(line.unitPrice)} × ${t('summary.daysCount', { count: line.days })}`}
          value={money(line.total)}
        />
      ))}
    </>
  );

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: BRAND.primary }}>{t('summary.title')}</DialogTitle>
      <DialogContent dividers>
        <Section title={t('summary.general')}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{summary.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(summary.startDate)} → {formatDate(summary.endDate)} · {t('summary.daysCount', { count: summary.days })}
          </Typography>
          {summary.sport && <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{summary.sport}</Typography>}
          {summary.address && <Typography variant="body2" color="text.secondary">{summary.address}</Typography>}
        </Section>

        <Section title={t('summary.lodging')}>
          {summary.lodging.length ? <PricedLines lines={summary.lodging} /> : <Typography variant="body2" color="text.secondary">—</Typography>}
        </Section>

        {summary.amenities.length > 0 && (
          <Section title={t('summary.amenities')}>
            <PricedLines lines={summary.amenities} />
            <Row label={t('summary.subtotal')} value={money(amenitiesTotal)} strong />
          </Section>
        )}

        <Section title={t('summary.activities')}>
          {summary.activities.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t('summary.noActivities')}</Typography>
          ) : (
            <>
              {summary.activities.map((activity, index) => (
                <Row
                  key={`${activity.kind}-${index}`}
                  label={`${t(`summary.kind.${activity.kind}`)}: ${activity.name}`}
                  value={money(activity.price)}
                />
              ))}
              <Row label={t('summary.subtotal')} value={money(activitiesTotal)} strong />
            </>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {t('summary.scheduleCount', { count: summary.scheduleCount })}
          </Typography>
        </Section>

        {summary.addOns.length > 0 && (
          <Section title={t('summary.addOns')}>
            {summary.addOns.map((addOn, index) => (
              <Row key={`${addOn.name}-${index}`} label={addOn.name} value={money(addOn.price)} />
            ))}
          </Section>
        )}

        {/* Precio real del getaway */}
        <Box sx={{ bgcolor: BRAND.primary, color: BRAND.white, borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {t('summary.priceFrom')}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 'bold', color: BRAND.lime, lineHeight: 1.2 }}>
            {money(priceFrom)}
            <Typography component="span" variant="body2" sx={{ ml: 1, color: BRAND.white, opacity: 0.85 }}>
              {t('detail.plusTax')}
            </Typography>
          </Typography>
          {priceTo > priceFrom && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('summary.priceTo', { price: money(priceTo) })}
            </Typography>
          )}
          <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
            {t('summary.priceNote')}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>
          {t('summary.back')}
        </Button>
        <Button
          variant="contained" startIcon={<SaveIcon />} onClick={onConfirm} disabled={saving}
          sx={{
            borderRadius: '20px', textTransform: 'none', fontWeight: 'bold',
            bgcolor: BRAND.primary, color: BRAND.white, ':hover': { bgcolor: BRAND.primaryDark },
          }}
        >
          {saving ? t('create.saving') : t('summary.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GetawaySummaryDialog;
