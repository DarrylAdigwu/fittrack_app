import React from "react";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router"
import Layout from "./components/Layout";
import Home from './pages/Home';
import About from './pages/About';

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route
      index
      element={<Home />}
    />
    <Route
      path="about"
      element={<About />}
    />
  </Route>
));

export default function App() {
  return (
    <RouterProvider router={router} />
  )
};
