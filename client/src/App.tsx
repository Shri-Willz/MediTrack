import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/dashboard";
import Medications from "@/pages/medications";
import Schedule from "@/pages/schedule";
import Reminders from "@/pages/reminders";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/medications" component={Medications} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/reminders" component={Reminders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
