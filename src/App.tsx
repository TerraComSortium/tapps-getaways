import { BrowserRouter, Route, Routes } from "react-router";
import Create from "./views/Create";
import Getaways from "./views/Getaways";
import Login from "./views/Login";
import Store from "./views/Store";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/store" element={<Store />} />
        <Route path="/getaways" element={<Getaways />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
