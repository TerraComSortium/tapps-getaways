import { BrowserRouter, Routes, Route } from "react-router";
import Login from "./views/Login";
import Store from "./views/Store";
import Getaways from "./views/Getaways";
import CreateGetaway from "./views/CreateGetaway";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/store" element={<Store />} />
        <Route path="/getaways" element={<Getaways />} />
        <Route path="/create" element={<CreateGetaway />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
