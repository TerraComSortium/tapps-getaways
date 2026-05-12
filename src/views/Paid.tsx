import { Container, Divider, Stack, Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

function Paid() {
  return (
    <>
      <Container
        sx={{
          pt:4, pb:4,
          width: { xs: '100%', sm: '70%' },
          display:"flex", flexDirection: 'column',
        }}
      >
        <Box sx={{
          // mt:8,
          pt:10,
          alignItems: 'center', justifyContent: 'center',
          bgcolor:'#371984'
        }}>
          <center>
            <TaskAltIcon sx={{ color:'#fff'}}  />
            <Typography component="h1" variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
              Thank you for your order! 🎉
            </Typography>
            <Typography
              sx={{
                pb:10,
                color: '#fff', textDecoration: 'none'
              }}>
              The payment receipt will be sent to your registered email address.
            </Typography>
          </center>

          <Divider aria-hidden="true" sx={{ borderColor: 'white', borderStyle: 'dashed' }} />
          <Box>
            <Stack sx={{
              m:2,
              display:"flex", flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Button startIcon={<ArrowBackIcon />} type="button" variant="contained"
                href="/getaways"
                sx={{
                  mt: 1, mb: 3, borderRadius:'8px',
                  minWidth: { xs: '200px', sm: '220px' },
                  bgcolor: '#3C1C91', color: '#FFF', fontWeight: 'bold', textTransform: 'none',
                  ':hover': { bgcolor: 'white', color: '#3C1C91'},
                  borderColor: 'primary.main', border: 1
                }}
              > Search more getaways!
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </>
  )
}
export default Paid;