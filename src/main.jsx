import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";

// Sin <StrictMode>: en desarrollo monta todo dos veces y eso rompe las etiquetas <Html> de drei.
createRoot(document.getElementById("root")).render(<App />);
