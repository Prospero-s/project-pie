/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
import "./styles/app.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";

/* if you're using Bootstrap */
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import TestPage from "./js/pages/Test";

console.log("test")

const Main = () => {
  console.log("test")
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<TestPage />} />
        {/* Ajoutez d'autres routes pour vos pages ici */}
      </Routes>
    </Router>
  );
};

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Main />);