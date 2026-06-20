import './App.css'
import './index.css'
import { useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ROUTES, ROUTE_PATTERNS } from './constants/routes';
import { Role } from './constants/roles';
import { ColorModeProvider } from './theme/ColorModeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GetawayDetail from './components/GetawayDetail';
import CreateGetaway from './components/CreateGetaway';
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './views/Landing';
import Login from './views/Login';
import Mygetaways from './views/Mygetaways';
import Getaways from './views/Getaways';
import BookGetaway from './views/BookGetaway';
import BookGetaway2 from './views/BookGetaway2';
import Reservations from './views/Reservations';
import Payment from './views/Payment';
import Paid from './views/Paid';
import DataView from './views/DataView';
import MyOrders from './views/MyOrders';

import { AppConfigProvider } from "./contexts/AppConfigContext";
import { FormDataProvider, useFormData } from './contexts/FormDataContext';
import { useWatchLocation } from './hooks/useWatchLocation';
import { useUserStore } from './store/useUserStore';
import { AuthProvider } from './contexts/AuthContext';
import TestApi from './views/TestApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_LIBRARIES = ['places'];
const DataViewWrapper: React.FC = () => {
  const { submissionData } = useFormData();
  if (!submissionData) {
    return <div style={{ padding: '16px' }}>No data available. Please fill the form first.</div>;
  }
  return <DataView result={submissionData} />;
};

interface GeocoderAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const getCityAndCountry = (components: GeocoderAddressComponent[]) => {
  let city = "";
  let country = "";

  components.forEach((comp) => {
    //getter city(locality)
    if (comp.types.includes("locality")) {
      city = comp.long_name;
    }
    //fallback: Google alternative getter
    else if (comp.types.includes("administrative_area_level_1") && !city) {
      city = comp.long_name;
    }
    if (comp.types.includes("country")) {
      country = comp.long_name;
    }
  });

  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "";
};

const queryClient =  new QueryClient({
  defaultOptions:{
    queries: {
      refetchOnWindowFocus: false,
      retry:1,
    }
  }
})

function App() {
  //console.log("key:", import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  useWatchLocation();

  const userLocation = useUserStore((state) => state.userLocation);
  const userAddress = useUserStore((state) => state.userAddress);
  console.log("InituserLocation:", userLocation, "InituserAddress:", userAddress);
  const setUserAddress = useUserStore((state) => state.setUserAddress);

  //Convert coords to {city, country} just once, to store in global state avoiding geocoding on every render
  useEffect(() => {
    const fetchAddress = async () => {
      if (!userLocation || userAddress !== "") return;
      console.log("userLocation:", userLocation, "userAddress:", userAddress);
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.lat},${userLocation.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();

        if (data.status === "OK" && data.results && data.results[0]) {
          const shortAddress = getCityAndCountry(data.results[0].address_components);
          setUserAddress(shortAddress || data.results[0].formatted_address);
        }
      } catch (error) {
        console.error("Error geocoding:", error);
      }
    };
    fetchAddress();
  }, [userLocation, userAddress, setUserAddress]);
  return (
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FormDataProvider>
            <ErrorBoundary>
              <AppConfigProvider>
                <APIProvider apiKey={API_KEY} version="quarterly" libraries={GOOGLE_MAPS_LIBRARIES}>
                  <Router>
                    <Navbar/>
                    <Routes>
                      <Route path={ROUTES.LANDING} element={<Landing />} />
                      <Route path={ROUTES.LOGIN} element={<Login />} />
                      <Route path={ROUTES.GETAWAYS} element={<Getaways/>} />
                      <Route path={ROUTES.MY_GETAWAYS} element={<ProtectedRoute><Mygetaways/></ProtectedRoute>}/>
                      <Route path={ROUTES.GETAWAY_DETAIL} element={<GetawayDetail/>} />
                      <Route path={ROUTES.BOOK_GETAWAY} element={<ProtectedRoute><BookGetaway /></ProtectedRoute>} />
                      <Route path={ROUTE_PATTERNS.BOOKING} element={<ProtectedRoute><BookGetaway2 /></ProtectedRoute>} />
                      <Route path={ROUTES.MY_ORDERS} element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                      <Route path={ROUTE_PATTERNS.PAYMENT} element={ <ProtectedRoute><Payment /></ProtectedRoute> } />
                      <Route path={ROUTES.PAID} element={<Paid />} />
                      <Route path={ROUTES.RESERVATIONS} element={<ProtectedRoute requiredRole={Role.ADMIN}><Reservations /></ProtectedRoute>} />
                      <Route path={ROUTES.CREATE_GETAWAY} element={<ProtectedRoute><CreateGetaway/></ProtectedRoute>} />
                      <Route path={ROUTES.DATA_VIEW} element={<DataViewWrapper />} />
                      <Route path={ROUTES.TEST_API} element={<TestApi/>} />
                    </Routes>
                    <Footer/>
                  </Router>
                </APIProvider>
              </AppConfigProvider>
            </ErrorBoundary>
          </FormDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ColorModeProvider>
  )
}
export default App