import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductInventory from "./products";

function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<ProductInventory />} />
                <Route path="/products" element={<ProductInventory />} />
            </Routes>
        </Router>
    );
}

export default AppRouter;

if (document.getElementById("samantha")) {
    ReactDOM.render(<AppRouter />, document.getElementById("samantha"));
}
