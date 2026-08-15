import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import ChatWidget from "./components/ChatWidget";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ChatWidget />
    </AuthProvider>
  );
}

export default App;