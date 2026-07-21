import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog";
import FindMyCoffee from "./pages/FindMyCoffee";
import Home from "./pages/Home";
import Roasters from "./pages/Roasters";
import Login from "./pages/Login";
import SavedBeans from "./pages/SavedBeans";
import Signup from "./pages/Signup";

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
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    );
}
