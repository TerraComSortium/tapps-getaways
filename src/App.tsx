import './App.css'
import './index.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './views/Landing'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './views/Login';
import Mygetaways from './views/Mygetaways';
import GetawayDetail from './components/GetawayDetail';
import BookGetaway from './views/BookGetaway';

function App() {
  return (
    <>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/getaways" element={<Mygetaways />} />
          <Route path="/getawaydetail" element={<GetawayDetail />} />
          <Route path="/bookgetaway" element={<BookGetaway />} />
        </Routes>
        <Footer/>
      </Router>
    </>
  )
}

export default App