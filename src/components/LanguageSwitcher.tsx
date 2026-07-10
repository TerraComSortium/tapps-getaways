import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Tooltip, ListItemText } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { SUPPORTED_LANGS, LANG_LABELS } from '../i18n';
import { BRAND } from '../theme/colors';

/**
 * Selector de idioma. Cambia i18n.language (persiste en localStorage vía
 * el LanguageDetector) y, con ello, el Accept-Language que envía axios.
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const current = (i18n.language || 'en').split('-')[0];

  const handleSelect = (lng: string) => {
    i18n.changeLanguage(lng);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title={t('nav.language')}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: BRAND.white, mr: 0.5 }}
          aria-label={t('nav.language')}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {SUPPORTED_LANGS.map((lng) => (
          <MenuItem key={lng} selected={lng === current} onClick={() => handleSelect(lng)}>
            <ListItemText>{LANG_LABELS[lng]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
