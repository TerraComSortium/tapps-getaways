import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import '../index.css';
import '../App.css';

import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { login } from '../api/authFirebase';

const defaultTheme = createTheme();

//validation schema with yup
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Invalid email address'
    ),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export interface LoginInput {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async(data: LoginInput) => {
    await login(data)
    navigate('/getaways');
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <div className="background-container"></div>
      <Container component="main" maxWidth="xs" style={{ position: 'relative' }}>
        <Box
          sx={{
            mt: { xs: 6, sm: 10 }, mb: { xs: 6, sm: 10 },
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            bgcolor: 'rgba(20, 8, 60, 0.72)',
            borderRadius: '16px',
            px: { xs: 2, sm: 4 },
            py: 4,
            backdropFilter: 'blur(6px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ color:'#C9F305', fontWeight:'bold' }}> Log in </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ m: 1, width: '100%' }}>
            <Controller name="email" defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField id="email" margin="normal" fullWidth
                  label="Email | Use your Racquets!™ account"
                  autoComplete="email"
                  {...field}
                  required
                  autoFocus
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ''}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#C9F305' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#C9F305' },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(20, 8, 60, 0.85)',
                      px: '4px',
                      borderRadius: '2px',
                    },
                    '& .MuiFormHelperText-root': { color: '#ffb3b3' },
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.08)' },
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(201,243,5,0.5)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C9F305' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C9F305' },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px rgba(20, 8, 60, 0.95) inset',
                      WebkitTextFillColor: '#fff',
                      caretColor: '#fff',
                    },
                  }}
                />
              )}
            />
            <Controller name="password" defaultValue=""
              control={control}
              render={({ field }) => (
                <TextField id="password" label="Password" margin="normal" fullWidth
                  {...field}
                  required
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password ? errors.password.message : ''}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiInputLabel-root': { color: '#C9F305' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#C9F305' },
                    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(20, 8, 60, 0.85)',
                      px: '4px',
                      borderRadius: '2px',
                    },
                    '& .MuiFormHelperText-root': { color: '#ffb3b3' },
                    '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.08)' },
                    '& .MuiInputBase-input': { color: '#fff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(201,243,5,0.5)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C9F305' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#C9F305' },
                    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                      WebkitBoxShadow: '0 0 0 1000px rgba(20, 8, 60, 0.95) inset',
                      WebkitTextFillColor: '#fff',
                      caretColor: '#fff',
                    },
                  }}
                />
              )}
            />
            <Button type="submit" variant="contained" fullWidth
              className="greenBtn"
              sx={{
                mt: 3, mb: 2, borderRadius: '8px', padding: '5px 15px',
                bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'bold',
                textTransform: 'none',
                ':hover': { bgcolor: 'white', color: '#3C1C91' }
               }}
            > Log In </Button>
            <Grid container sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
              <Grid>
                <Typography
                  sx={{ color: '#fff', textDecoration: 'none' }}>
                  Don't have a Racquets! AppSuite™ account?
                </Typography>
              </Grid>
              <Grid
                container direction="row" justifyContent="center" alignItems="center"
                spacing={{ xs: 2, sm: 4 }}
                sx={{ flexGrow: 1, mt: 2 }}
              >
                <Grid>
                  <Button startIcon={<ShopIcon />} target="_blank" variant="contained"
                    href="https://play.google.com/store/apps/details?id=com.terracomsortium.tapps&hl=es_CO"
                    sx={{
                      borderRadius: '8px', padding: '5px 15px',
                      bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'bold',
                      textTransform: 'none',
                      ':hover': { bgcolor: 'white', color: '#3C1C91' }
                     }}
                  > Google store </Button>
                </Grid>
                <Grid>
                  <Button startIcon={<AppleIcon />} target="_blank" variant="contained"
                    href="https://apps.apple.com/co/app/racquetsappsuite/id1592585843"
                    sx={{
                      borderRadius: '8px', padding: '5px 15px',
                      bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'bold',
                      textTransform: 'none',
                      ':hover': { bgcolor: 'white', color: '#3C1C91' }
                    }}
                  > Apple Store </Button>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default Login;