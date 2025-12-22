import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from "wouter";
import "./index.css";
import App from "./App.jsx";
import FileDetails from "./pages/FileDetails.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Switch>
      <Route path="/" component={App} />
      <Route path="/:simpleID" component={FileDetails} />
    </Switch>
  </StrictMode>,
);
