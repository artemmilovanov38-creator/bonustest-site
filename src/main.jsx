import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/admin.css";
import "./styles/dashboard.css";
import "./styles/buttons.css";
import "./styles/cards.css";
import "./styles/forms.css";
import "./styles/modal.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);