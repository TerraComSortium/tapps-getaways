import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import prevPhoto from "../assets/backgrounds/hotel.jpg";
import "../App.css";

const isPhotoUrl = (url: string): boolean => {
  if (!url) return false;
  const videoRegex = /youtube\.com|youtu\.be|vimeo\.com/;
  return !videoRegex.test(url);
};
interface GetawayItemProps {
  name: string;
  dates: string;
  price: number;
  lodgingOptions: { name: string; price: number }[];
  sport: string;
  galleryPhotos: string[];
  onViewDetails: () => void;
  onBookNow: () => void;
}

function GetawayItem({
  name,
  dates,
  price,
  lodgingOptions,
  sport,
  galleryPhotos,
  onViewDetails,
  onBookNow,
}: GetawayItemProps) {
  const navigate = useNavigate();
  // const toGetaway = () => {
  //   navigate('/getawaydetail');
  // };

  const editGetaway = () => {
    navigate("/creategetaway");
  };

  const bookings = () => {
    navigate("/reservations");
  };

  //previewImg Check
  const getDisplayImage = (): string => {
    if (galleryPhotos && galleryPhotos.length > 0) {
      const firstPhoto = galleryPhotos[0];
      // img validation
      if (isPhotoUrl(firstPhoto)) {
        return firstPhoto; //pick first img
      }
    }
    return prevPhoto; //default img
  };

  const imageUrl = getDisplayImage();

  return (
    <>
      <Card
        elevation={0}
        sx={{
          display: "flex",
          mb: 2,
          borderRadius: "10px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px 0 #c1c9d7, 0 -2px 8px 0 #cce1e9",
        }}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <Box>
            <Typography
              // onClick={toGetaway}
              onClick={onViewDetails}
              sx={{ fontSize: "16px", color: "#3C1C91", fontWeight: "600" }}
              style={{ cursor: "pointer" }}
            >
              {" "}
              {name}{" "}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", fontWeight: "normal" }}
            >
              By
              {/* {rcnet.name ||  */}
              {" Getaway name unavailable"}
              {/* } */}
            </Typography>

            <Typography
              variant="subtitle2"
              sx={{ color: "text.secondary", fontWeight: "normal" }}
            >
              Dates: {dates}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: "normal",
                    alignItems: "center",
                  }}
                >
                  Pricing Starts at:
                </Typography>
                {/* enlist array */}
                {/* {lodgingOptions && lodgingOptions.length > 0 ? (
                  lodgingOptions.map((option, index) => (
                    <Typography key={index} variant="body2" sx={{ color: 'text.primary' }}>
                      {option.name} ${option.price}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>Unavailable pricing</Typography>
                )} */}
                <Typography variant="body2" sx={{ color: "text.primary" }}>
                  {price || "-"}
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* <Box component="p" sx={{ fontSize: 14, color: "black", m: '10px 0'}}> {description} </Box> */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              disableElevation
              sx={{
                width: 120,
                padding: "0 5",
                borderRadius: "30px",
                bgcolor: "#3C1C91",
                color: "#fff",
                fontVariantCaps: "normal",
                textTransform: "none",
              }}
              onClick={onBookNow}
            >
              {" "}
              Book now{" "}
            </Button>
            <Button
              onClick={bookings}
              disableElevation
              sx={{
                width: 136,
                m: "0 0.5rem",
                borderRadius: "30px",
                bgcolor: "#3C1C91",
                color: "#fff",
                fontVariantCaps: "normal",
                textTransform: "none",
              }}
            >
              {" "}
              Reservations{" "}
            </Button>
            <Button
              variant="outlined"
              sx={{
                width: 120,
                padding: "0 2",
                m: "0 0.5rem",
                display: "flex",
                alignItems: "center",
                borderRadius: "30px",
                borderColor: "#3C1C91",
                bgcolor: "#fff",
              }}
            >
              <SportsTennisIcon sx={{ color: "#3C1C91", pr: "3px" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  color: "#3C1C91",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                {sport}
              </Typography>
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ width: 300, flexShrink: 0, position: "relative" }}>
          <CardMedia
            image={imageUrl}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              borderRadius: "0 10px 10px 0",
            }}
          />
          <Box
            sx={{
              display: "flex",
              position: "relative",
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              onClick={editGetaway}
              disableElevation
              sx={{
                padding: "8px 24px",
                color: "#1A2660",
                bgcolor: "#00E392",
                borderRadius: "30px",
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              {" "}
              Edit getaway
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
}
export default GetawayItem;
