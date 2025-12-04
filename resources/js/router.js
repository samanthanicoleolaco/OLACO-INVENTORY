import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Products from "./products";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/products" element={<Products />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;
