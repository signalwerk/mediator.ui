import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createHashRouter, RouterProvider } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import reportWebVitals from "./reportWebVitals";

// import Root, { rootLoader } from "./routes/root";
// import Project, { projectLoader } from "./routes/project";
import Root from "./routes/root";
import Project from "./routes/project";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    // loader: rootLoader,
    children: [],
  },
  {
    path: "projects/:projectId",
    element: <Project />,
    // loader: teamLoader,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
