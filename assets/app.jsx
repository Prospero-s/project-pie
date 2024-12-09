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
import "./css/app.css";
import { UserProvider } from "@/context/userContext";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Investments from "@/pages/Investments";
import AuthLayout from "@/components/common/layout/AuthLayout";
import ProtectedRoute from "@/components/common/auth/ProtectedRoute";
import AppLayout from "@/components/common/layout/AppLayout";
import.meta.glob(["../img/**"]);
import i18n from "./js/i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <Router>
        <Routes>
          <Route
            path="/:lng/auth/*"
            element={
              <AuthLayout i18n={i18n}>
                <Routes>
                  <Route path="signin" element={<SignIn i18n={i18n} />} />
                  <Route path="signup" element={<SignUp i18n={i18n} />} />
                  <Route path="reset-password" element={<ResetPassword i18n={i18n} />} />
                </Routes>
              </AuthLayout>
            }
          />
          <Route
            path="/:lng/*"
            element={
              <ProtectedRoute i18n={i18n}>
                <AppLayout i18n={i18n}>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard i18n={i18n} />} />
                    <Route path="investments" element={<Investments i18n={i18n} />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
  </React.StrictMode>
);