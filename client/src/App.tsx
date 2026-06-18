import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Catalog from "./pages/Catalog";
import FindMyCoffee from "./pages/FindMyCoffee";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/" element={<Navigate to="/catalog" />} />
                <Route path="/find-my-coffee" element={<FindMyCoffee />} />
            </Routes>
        </BrowserRouter>
    );
}
