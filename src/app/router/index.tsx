import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "../../pages/Home";

// Code-split all secondary pages for instantaneous initial home load
const About = lazy(() => import("../../pages/About"));
const Projects = lazy(() => import("../../pages/Projects"));
const Gallery = lazy(() => import("../../pages/Gallery"));
const Certificates = lazy(() => import("../../pages/Certificates"));
const Features = lazy(() => import("../../pages/Features"));
const Comments = lazy(() => import("../../pages/Comments"));
const AdminLogin = lazy(() => import("../../pages/AdminLogin"));
const AdminDashboard = lazy(() => import("../../pages/AdminDashboard"));

const RouteSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="w-full min-h-[50vh] flex items-center justify-center pointer-events-none">
      <div className="w-7 h-7 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
    </div>
  }>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <RouteSuspense><About /></RouteSuspense>,
      },
      {
        path: "projects",
        element: <RouteSuspense><Projects /></RouteSuspense>,
      },
      {
        path: "gallery",
        element: <RouteSuspense><Gallery /></RouteSuspense>,
      },
      {
        path: "certificates",
        element: <RouteSuspense><Certificates /></RouteSuspense>,
      },
      {
        path: "features",
        element: <RouteSuspense><Features /></RouteSuspense>,
      },
      {
        path: "commission",
        element: <Navigate to="/about" replace />,
      },
      {
        path: "contact",
        element: <Navigate to="/about" replace />,
      },
      {
        path: "comments",
        element: <RouteSuspense><Comments /></RouteSuspense>,
      },
      {
        path: "admin",
        element: <RouteSuspense><AdminLogin /></RouteSuspense>,
      },
      {
        path: "admin/dashboard",
        element: <RouteSuspense><AdminDashboard /></RouteSuspense>,
      }
    ],
  },
]);
