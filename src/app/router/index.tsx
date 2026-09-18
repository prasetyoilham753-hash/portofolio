import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import Home from "../../pages/Home";
import About from "../../pages/About";
import Projects from "../../pages/Projects";
import Gallery from "../../pages/Gallery";
import Certificates from "../../pages/Certificates";
import Commission from "../../pages/Commission";
import QnA from "../../pages/QnA";
import AdminLogin from "../../pages/AdminLogin";
import AdminDashboard from "../../pages/AdminDashboard";

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
        element: <About />,
      },
      {
        path: "projects",
        element: <Projects />,
      },
      {
        path: "gallery",
        element: <Gallery />,
      },
      {
        path: "certificates",
        element: <Certificates />,
      },
      {
        path: "commission",
        element: <Commission />,
      },
      {
        path: "qna",
        element: <QnA />,
      },
      {
        path: "admin",
        element: <AdminLogin />,
      },
      {
        path: "admin/dashboard",
        element: <AdminDashboard />,
      }
    ],
  },
]);
