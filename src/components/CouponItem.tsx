import { memo } from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { BRAND } from '../theme/colors';

interface CouponItemProps {
  // key: string;
  title: string;
  description: string;
  dates: string;
  // code: string;
  discount: number;
  userLimit: number;
  usersUsed: string[];
  // discountPercent?: number;
  // isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export const CouponItem = memo(({
  // key,
  title, description, dates,
  // code,
  discount,
  userLimit,
  usersUsed,
  // discountPercent,
  // isActive = true,
  createdAt,
  updatedAt,
  onEdit,
  onDelete, isDeleting,
}: CouponItemProps) => (
  <Card elevation={0} sx={{
    display: 'flex', mb: 2, borderRadius: '10px',
    backgroundColor: BRAND.bgPaper,
    boxShadow: '0 2px 8px 0 #c1c9d7, 0 -2px 8px 0 #cce1e9'
  }}>
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
      <Typography sx={{ fontSize: 16, color: BRAND.primary, fontWeight: 600 }}>
        {title}
      </Typography>
      {/* <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
        {key}
      </Typography> */}
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 'normal' }}>
        {dates}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
       {description}
      </Typography>
        {/* {
        discountAmount
          ? `$${discountAmount} off`
          : `${discountPercent}% off`
        } */}
      {/* <Typography variant="caption" sx={{ color: BRAND.primary, fontWeight: 'bold' }}>
        {discount}% Off
      </Typography> */}
      <Chip size="medium"
        icon={ <LocalOfferIcon sx={{ p:'0 1px', color: 'text.primary',  }} /> }
        label={`${discount}% Off`}
        sx={{
          width: 'fit-content',
          // mt: 1,
          px:'3px',
          // bgcolor: isActive ? BRAND.green : BRAND.bgPaper,
          color: BRAND.navy, fontWeight: 'bold'
        }}
      />
      {/* <Chip size="small"
        label={isActive ? 'active' : 'inactive'}
        sx={{
          width: 'fit-content',
          // mt: 1,
          px:'3px',
          // bgcolor: isActive ? BRAND.green : BRAND.bgPaper,
          color: BRAND.navy, fontWeight: 'bold'
        }}
      /> */}
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        <Chip size="small"
          label={`Users limit: ${userLimit}`}
          sx={{
            width: 'fit-content',
            // mt: 1,
            px:'3px',
            // bgcolor: isActive ? BRAND.green : BRAND.bgPaper,
            color: BRAND.navy, fontWeight: 'bold'
          }}
        />
        <Chip size="small"
          label={`Users used: ${usersUsed.length}`}
          sx={{
            width: 'fit-content',
            // mt: 1,
            px:'3px',
            // bgcolor: isActive ? BRAND.green : BRAND.bgPaper,
            color: BRAND.navy, fontWeight: 'bold'
          }}
        />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
       Created at: {createdAt} | Updated at: {updatedAt}
      </Typography>
      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
        {onEdit && (
          <Button startIcon={<EditIcon/>} onClick={onEdit} disableElevation size="small"
            sx={{ px:3, borderRadius: '30px', bgcolor: BRAND.green, color: BRAND.navy,
              textTransform: 'none', fontWeight: 'bold' }}
          > Edit
          </Button>
        )}
        {onDelete && (
          <Button startIcon={<DeleteIcon/>} onClick={onDelete}
            disabled={isDeleting} disableElevation size="small"
            sx={{ px:2, borderRadius: '30px', bgcolor: BRAND.primary, color: BRAND.white,
            textTransform: 'none', opacity: isDeleting ? 0.7 : 1 }}
          > {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
));