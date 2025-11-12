import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AppleIcon from '@mui/icons-material/Apple';
import ShopIcon from '@mui/icons-material/Shop';
import '../index.css';
import '../App.css';
import { useState } from "react";
import auth from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

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

interface LoginInput {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: yupResolver(schema),
  });
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setFirebaseError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("Usuario autenticado: ", user);

      if (user.accessToken) {
        localStorage.setItem("token", user.accessToken);
      }
      navigate('/getaways');
    } catch (err: any) {
      setFirebaseError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <div className="background-container"></div>
      <Container component="main" maxWidth="xs" style={{ position: 'relative' }}>
        <Box
          sx={{ mt: 10, mb: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Typography component="h1" variant="h5" sx={{ color:'#C9F305', fontWeight:'bold' }}> Log in </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ m: 1 }}>
            {firebaseError && (
              <Typography sx={{ color: 'red', mb: 2 }}>
                {firebaseError}
              </Typography>
            )}
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
                />
              )}
            />
            <Button type="submit" variant="contained" fullWidth
              className="greenBtn"
              disabled={loading}
              sx={{
                mt: 3, mb: 5, borderRadius: '8px', padding: '5px 15px', margin: '5 5px',
                bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'bold',
                textTransform: 'none',
                ':hover': { bgcolor: 'white', color: '#3C1C91' }
               }}
            > {loading ? 'Logging in...' : 'Log In'} </Button>
            <Grid container sx={{ marginTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
              <Grid>
                <Typography
                  sx={{
                    textDecoration: 'none' }}>
                  Don't have a Racquets! AppSuite™ account?
                </Typography>
              </Grid>
              <Grid
                container direction="row" justifyContent="center" alignItems="center" spacing={10}
                sx={{ flexGrow: 1, height: '30px' }}
              >
                <Grid>
                  <Button startIcon={<ShopIcon />} target="_blank" variant="contained"
                    href="https://play.google.com/store/apps/details?id=com.terracomsortium.tapps&hl=es_CO"
                    sx={{
                      mt: 3, mb: 5, borderRadius: '8px', padding: '5px 15px', margin: '5 5px',
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
                      mt: 3, mb: 5, borderRadius: '8px', padding: '5px 15px', margin: '5 5px',
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
