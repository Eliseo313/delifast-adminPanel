import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./components/LoginPage";
import HomeLayout from "./components/HomeLayout"; // layout con sidebar y header
import ReclamosPage from "./components/ReclamosPage";
import Settings from "./components/SettingsPage";
import ChangePasswordPage from "./components/ChangePasswordPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login */}
        <Route path="/adminPanel" element={<Login />} />

        {/* Layout protegido */}
        <Route
          path="/adminPanel"
          element={
            <PrivateRoute>
              <HomeLayout />
            </PrivateRoute>
          }
        >
          {/* Hijas dentro del layout */}
          <Route path="home" element={<ReclamosPage />} />
          <Route path="settings" element={<Settings />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
