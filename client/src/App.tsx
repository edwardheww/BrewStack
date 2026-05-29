import { BrowserRouter, Routes, Route } from "react-router-dom";
import Catalog from "./pages/Catalog.js"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/catalog" element={<Catalog />} />
            </Routes>
        </BrowserRouter>
    );
}
