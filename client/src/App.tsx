import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import FindMyCoffee from "./pages/FindMyCoffee";
import Home from "./pages/Home";
import Roasters from "./pages/Roasters";
import Login from "./pages/Login";
import SavedBeans from "./pages/SavedBeans";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/find-my-coffee" element={<FindMyCoffee />} />
                <Route path="/roasters" element={<Roasters />} />
                <Route path="/login" element={<Login />} />
                <Route path="/saved-beans" element={<SavedBeans />} />
            </Routes>
        </BrowserRouter>
    );
}
