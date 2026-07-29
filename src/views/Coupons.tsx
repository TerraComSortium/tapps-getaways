import React, { useState,
  // useEffect
} from 'react';
import { useTranslation } from 'react-i18next';
import { useForm,
  Controller, useFieldArray,
  SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  //  Stack, CircularProgress, Link
} from '@mui/material';
import Grid from '@mui/material/Grid2';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import { styled } from '@mui/material/styles';
import { BRAND } from '../theme/colors';
import AdminSideBar from '../components/AdminSidebar';
import  DiscountForm  from '../components/DiscountForm';
import { GetawayItem } from '../components/CouponItem';
import { GetawayFormData } from '../types/getaway';

function Coupons(
  // { control, discountFields, appendDiscount, removeDiscount, handleSubmit, onSubmit, t }
) {
  const { control,
    discountFields, appendDiscount, removeDiscount,
    handleSubmit,
    // onSubmit,
    // t,
    formState: { errors } } = useForm<GetawayFormData>({
      defaultValues: {
        title: "",
        overview: "",
        getawayAddress: { address: "", lat: null, lng: null },
        galleryPhotos: [],
        lodgingOptions: [{ name: "", price: 0 }],
        optionalAddOns: [{ name: "", price: 0 }],
        amenities: [{ name: "" }],
        schedule: [],
        discounts: []
      }
    });
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [openModal, setOpenModal] = useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  //Add new coupon
  const handleAddDiscount = () => {
    appendDiscount({
      couponCode: "",
      startDate: "",
      endDate: "",
      description: "",
      amount: 0,
      isActive: true
    });
  };

  const onSubmit: SubmitHandler<GetawayFormData> = async (data) => {
    console.log('Form data:', data);
  }
  return (
    <>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Grid container columnSpacing={{ xs: 0, sm: 2, md: 3 }}>
        <AdminSideBar />
        <Grid size={{ xs: 12, sm: 9, md: 10 }} className="section blueBg"  sx={{ minWidth: 0 }}>
          <Box sx={{ padding: '7px 0px' }}>
            <Typography variant="h5">
              {/* {t('coupons.viewTitle')} */}
              Coupons management
            </Typography>
            <Typography sx={{ mt: 1, color:'text.secondary' }}>
            {/* {coupons?.length > 0
              ? t('coupons.couponsCount', { count: coupons.length })
              : t('coupons.noCoupons')
            } */}
              1 coupons active
            </Typography>
            <Button startIcon={<AddIcon />} variant="contained" aria-label="Add discount"  disableElevation
              onClick={handleOpen}
              // original:
              // onClick={() => appendDiscount({
              //   couponCode: "",
              //   startDate: "",
              //   endDate: "",
              //   description: "",
              //   amount: 0,
              //   isActive: true
              // })}
              sx={{
                mt: 2, mb: 3, bgcolor:BRAND.primary, color:  BRAND.white, borderRadius: '30px', fontWeight: 'bold', textTransform: 'none',
                ':hover': { bgcolor:BRAND.white, color:BRAND.primary }
              }}
            >
            {/* {t('create.addItem')}  */}
            Add coupon</Button>
            <GetawayItem name="September's Deal" dates="Sep 23, 2026 - Sep 25, 2026" sport='CODE: SEPT25' lodgingOptions={[{ name: "Discount amount:", price: 100 }]} />
              <Dialog
                open={openModal}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                  sx: { borderRadius:'16px', p:1 }
                }}
              >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                  <Typography variant="h6" color={BRAND.primary} sx={{ fontWeight: "bold" }}>
                    Create coupon
                  </Typography>
                  <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>

                <form onSubmit={handleSubmit((data) => {
                  onSubmit(data);
                  handleClose();
                })}>
                  <DialogContent dividers>
                    {/* {discountFields.map((field, index) => ( */}
                      <DiscountForm
                        // key={field.id}
                        control={control}
                        // index={index}
                        remove={removeDiscount}
                      />
                    {/* ))} */}

                    <Button variant="outlined" aria-label="Add discount"
                      startIcon={<AddIcon />}
                      onClick={handleAddDiscount}
                      sx={{
                        mt: 2,
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                      }}
                    >
                      {t('create.addItem')}
                    </Button>
                  </DialogContent>

                  <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose} color="inherit" sx={{ borderRadius: '20px' }}>
                      Cancel
                    </Button>
                    <Button variant="contained"
                      type="submit"
                      sx={{
                        color: BRAND.white, bgcolor: BRAND.primary,
                        borderRadius: '20px', px: 3,
                        ':hover': { bgcolor: BRAND.primaryDark }
                      }}
                    >
                      Save Coupons
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>


            {/* {loading ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '250px',
                bgcolor: 'background.paper',
                borderRadius: '12px'
              }}>
                <CircularProgress size={36} sx={{ color: BRAND.primary, mb: 2 }}/>
                <Typography variant="body2" color="text.secondary">{t('coupons.fetchingCoupons')}</Typography>
              </Box>
            ):(
              <ul>
                <Typography variant="body2" color="text.secondary">
                  No coupons available. Please add a new coupon using the "Add coupon" button above.
                </Typography>

                {coupons?.map((coupon: any) => (
                  <li key={coupon.id}>{coupon.name} - {coupon.description}</li>
                ))}
              </ul>
            )} */}
          </Box>
        </Grid>
      </Grid>
      </Box>
    </>
  );
}
export default Coupons;