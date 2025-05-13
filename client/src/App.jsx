import React from "react";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router"
import Layout, { loader as layoutLoader } from "./components/Layout";

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />} loader={layoutLoader}>

  </Route>
));

export default function App() {
  return (
    <RouterProvider router={router} />
  )
};
