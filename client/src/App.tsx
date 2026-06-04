import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Catalog from "./pages/Catalog";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/" element={<Navigate to="/catalog" />} />
            </Routes>
        </BrowserRouter>
    );
}
