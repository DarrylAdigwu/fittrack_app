import React from 'react';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, redirect } from 'react-router';
import Layout from './components/Layout.jsx';
import Error from './pages/Error.jsx';
import ErrorBoundary from './pages/ErrorBoundary.jsx';
import Home from './pages/Home.jsx';
import Register, { action as registerAction } from './pages/Register.jsx';
import Login, { action as loginAction } from './pages/Login.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dashboard, { loader as dashboardLoader, action as dashboardAction } from './pages/profile/Dashboard.jsx';
import { usersUsername } from '../client-utils.js';
import Calendar from './pages/profile/Calendar.jsx';


const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route 
      index 
      element={<Home />}
      errorElement={<ErrorBoundary />}
    />
    <Route
      path="register"
      element={<Register />}
      action={registerAction}
    />
    <Route
      path="login"
      element={<Login />}
      errorElement={<ErrorBoundary />}
      action={loginAction}
    />

    <Route
      path="dashboard"
      element={<DashboardLayout />}
      errorElement={<ErrorBoundary />}
    >
      <Route
        index
        loader={async({request}) => {
          return redirect(`${usersUsername}`)
        }}
      />
      <Route
        path={`:${usersUsername}`}
        element={<Dashboard />}
        hydrateFallbackElement={<React.Suspense fallback={<h2 className='loading'>Loading...</h2>}></React.Suspense>}
        loader={dashboardLoader}
        action={dashboardAction}
      >
        <Route
          path="calendar"
          element={<Calendar />}
        />
      </Route>
    </Route>
    {/* Error page */} 
    <Route 
      path="*"
      element={<Error />}
    />
  </Route>
));

export default function App() {
  return (
    <RouterProvider router={router} />
  )
};

    