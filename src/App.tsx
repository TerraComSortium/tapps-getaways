import './App.css'
import './index.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GetawayDetail from './components/GetawayDetail';

import Landing from './views/Landing'
import Login from './views/Login';
import Mygetaways from './views/Mygetaways';
import BookGetaway from './views/BookGetaway';
import Payment from './views/Payment';
import Paid from './views/Paid';
import Reservations from './views/Reservations';
import CreateGetaway from './components/CreateGetaway';
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AppConfigProvider } from "./contexts/AppConfigContext";
import { FormDataProvider, useFormData } from './contexts/FormDataContext';
import DataView from './views/DataView';

const DataViewWrapper: React.FC = () => {
  const { submissionData } = useFormData();
  if (!submissionData) {
    return <div>No data available. Fill the form first.</div>;
  }
  return <DataView result={submissionData} />;
};
function App() {
  return (
    <>
      <FormDataProvider>
        <ErrorBoundary>
        <AppConfigProvider>
            <Router>
              <Navbar/>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/getaways" element={<Mygetaways />} />
                <Route path="/getawaydetail" element={<GetawayDetail />} />
                <Route path="/bookgetaway" element={<BookGetaway />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/paid" element={<Paid />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/creategetaway" element={ <CreateGetaway/> } />
                <Route path="/data-view" element={<DataViewWrapper />} />
              </Routes>
              <Footer/>
            </Router>
          </AppConfigProvider>
        </ErrorBoundary>
      </FormDataProvider>
    </>
  )
}

export default App