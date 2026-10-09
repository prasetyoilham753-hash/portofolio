import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "../../pages/Home";

// Elegant root error boundary to prevent blank white screens
function RootErrorBoundary() {
  const error = useRouteError();
  console.error("[Router Error]", error);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-bg-secondary/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mx-auto mb-4 text-brand-primary">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-white mb-2">
          Terjadi Gangguan Navigasi
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6 font-light">
          Halaman tidak dapat dimuat sementara. Silakan segarkan halaman untuk kembali melanjutkan.
        </p>
        <button
          onClick={() => {
            window.location.href = import.meta.env.BASE_URL || "/";
          }}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-all active:scale-[0.98]"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}

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

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <RootErrorBoundary />,
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
        },
        {
          path: "*",
          element: <Navigate to="/" replace />,
        }
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    }
  ],
  {
    basename: import.meta.env.BASE_URL || "/",
  }
);
