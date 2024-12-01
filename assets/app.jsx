/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./styles/theme.scss";
import App from "./js/pages/Test.jsx";
import PdfUploader from "./js/pages/PdfUpload.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/test" element={<App />} />
        <Route path="/pdf" element={<PdfUploader />} />
      </Routes>
    </Router>
  </React.StrictMode>
);