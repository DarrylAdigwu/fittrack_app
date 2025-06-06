import React from 'react';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, redirect } from 'react-router';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Register, { action as registerAction } from './pages/Register.jsx';
import Login, { action as loginAction } from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dashboard, { loader as dashboardLoader, action as dashboardAction } from './pages/profile/Dashboard.jsx';
import { authUser, usersUsername } from '../client-utils.js';


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
    <Route
      path="register"
      element={<Register />}
      action={registerAction}
    />
    <Route
      path="login"
      element={<Login />}
      action={loginAction}
    />

    <Route
      path="dashboard"
      element={<DashboardLayout />}
    >
      <Route
        index
        loader={async({request}) => {
          await authUser(request)
          return redirect(`${usersUsername}`)
        }}
      />
      <Route
        path={`:${usersUsername}`}
        element={<Dashboard />}
        hydrateFallbackElement={<React.Suspense fallback={<h2 className='loading'>Loading...</h2>}></React.Suspense>}
        loader={dashboardLoader}
        action={dashboardAction}
      />
    </Route>
    {/* Error page */} 
    {/* <Route 
      path="*"
      element={<Error />}
    /> */}
  </Route>
));

export default function App() {
  return (
    <RouterProvider router={router} />
  )
};

    