import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { auth } from "./CoralFirebase-config";
import { onAuthStateChanged } from "firebase/auth";
import CoralHeader from "./CoralHeader";
import CoralFooter from "./CoralFooter";
import CoralIndex from "./CoralIndex";
import CoralHomepage from "./CoralHomepage";
import CoralSignup from "./CoralSignup";
import CoralChalice from "./CoralChalice";
import CoralMonti from "./CoralMonti";
import CoralMushrooms from "./CoralMushrooms";
import CoralNPSCorals from "./CoralNPSCorals";
import CoralScoly from "./CoralScoly";
import CoralZoas from "./CoralZoas";
import CoralAcro from "./CoralAcro";
import CoralFavia from "./CoralFavia";
import CoralAquascape from "./CoralAquascape";
import CoralFishTankFurn from "./CoralFishTankFurn";
import "./corals_page.css";

const Coral_Main = () => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // Added state to manage dark mode
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = () => {
    // Define toggleDarkMode function
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Directly consider only the first segment after `/corals/` as valid.
      const pathSegment = location.pathname.split("/").pop();

      console.log("Current Path Segment:", pathSegment);

      const allowedPathsAuthenticated = [
        "homepage",
        "index",
        "scoly",
        "chalice",
        "signup",
        "monti",
        "mushroom",
        "nps",
        "zoas",
        "acro",
        "favia",
        "fishtank",
        "aquascape",
      ];
      const allowedPathsUnauthenticated = [
        "index",
        "signup",
        "homepage",
        "index",
        "scoly",
        "chalice",
        "signup",
        "monti",
        "mushroom",
        "nps",
        "zoas",
        "acro",
        "favia",
        "fishtank",
        "aquascape",
      ];

      if (!user && !allowedPathsUnauthenticated.includes(pathSegment)) {
        console.log("Unauthorized access - redirecting to index");
        navigate("/corals/index", { replace: true });
      } else if (user && !allowedPathsAuthenticated.includes(pathSegment)) {
        console.log("Authorized but wrong path - redirecting to homepage");
        navigate("/corals/homepage", { replace: true });
      }
    }
  }, [user, location.pathname, navigate, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="coral-main-page-container">
      <CoralHeader
        user={user}
        onToggleDarkMode={toggleDarkMode}
        onNavigate={navigate}
      />
      <Routes>
        <Route path="index" element={<CoralHomepage />} />
        <Route path="homepage" element={<CoralHomepage />} />
        {/* <Route path="homepage" element={user ? <CoralHomepage /> : <Navigate replace to="/corals/index" />} /> */}
        <Route
          path="acro"
          element={
            user ? <CoralAcro /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="favia"
          element={
            user ? <CoralFavia /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="chalice"
          element={
            user ? <CoralChalice /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="scoly"
          element={
            user ? <CoralScoly /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="monti"
          element={
            user ? <CoralMonti /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="mushroom"
          element={
            user ? <CoralMushrooms /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="nps"
          element={
            user ? <CoralNPSCorals /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="zoas"
          element={
            user ? <CoralZoas /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route
          path="fishtank"
          element={
            user ? (
              <CoralFishTankFurn />
            ) : (
              <Navigate replace to="/corals/index" />
            )
          }
        />
        <Route
          path="aquascape"
          element={
            user ? <CoralAquascape /> : <Navigate replace to="/corals/index" />
          }
        />
        <Route path="signup" element={<CoralSignup />} />
        <Route path="*" element={<Navigate replace to="/corals/index" />} />
      </Routes>
      <CoralFooter />
    </div>
  );
};

export default Coral_Main;
