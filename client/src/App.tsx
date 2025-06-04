import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import SignUp from "@/pages/sign-up"
import SignIn from "@/pages/sign-in"
import Dashboard from "@/pages/dashboard";
import Medications from "@/pages/medications";
import Schedule from "@/pages/schedule";
import Reminders from "@/pages/reminders";
import NotFound from "@/pages/not-found";
import ForgotPass from "@/pages/forgot-pass";






const router = createBrowserRouter([
  {
    path:"/",
    element:<SignIn />,
    errorElement:<NotFound />
  },
  {
    path:"/signup",
    element:<SignUp />,
  },
  {
    path:"/dashboard",
    element:<Dashboard />,
  },
  {
    path:"/medications",
    element:<Medications />,
  },
  {
    path:"/schedule",
    element:<Schedule />,
  },
   {
    path:"/reminders",
    element:<Reminders />,
  },
  {
    path:"/forgotpass",
    element:<ForgotPass/>
  }
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
       <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
