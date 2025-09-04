import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import { UserAuthContext, useUserAuthProvider } from "@/hooks/useUserAuth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import TruckDetail from "@/pages/truck-detail";
import DealerLogin from "@/pages/dealer-login";
import DealerDashboard from "@/pages/dealer-dashboard";
import AddTruck from "@/pages/add-truck";
import EditTruck from "@/pages/edit-truck";
import EditTrailer from "@/pages/edit-trailer";
import DealerProtectedRoute from "@/components/dealer-protected-route";
import Sell from "@/pages/sell";
import SellIndividual from "@/pages/sell-individual";
import FinanceCalculator from "@/pages/finance-calculator";

import Pricing from "@/pages/pricing";
import Subscribe from "@/pages/subscribe";
import SubscriptionSuccess from "@/pages/subscription-success";
import SignIn from "@/pages/sign-in";
import SignUp from "@/pages/sign-up";
import DealerSignup from "@/pages/dealer-signup";
import DealerSignupSuccess from "@/pages/dealer-signup-success";
import DealerSubscribe from "@/pages/dealer-subscribe";
import DealerSubscriptionSuccess from "@/pages/dealer-subscription-success";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import SavedListings from "@/pages/saved-listings";
import EditIndividualListing from "@/pages/edit-individual-listing";
import IndividualListingDetail from "@/pages/individual-listing-detail";
import { AdminProtectedRoute } from "@/components/admin-protected-route";
import ScrollToTop from "@/components/scroll-to-top";
import Trailers from "@/pages/trailers";
import TrailerDetail from "@/pages/trailer-detail";
import Help from "@/pages/help";
import ForgotPassword from "@/pages/forgot-password";
import DealerForgotPassword from "@/pages/dealer-forgot-password";
import ResetPassword from "@/pages/reset-password";
import DealerProfile from "@/pages/dealer-profile";
import UserProfile from "@/pages/user-profile";
import TermsOfService from "@/pages/terms-of-service";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/trailers" component={Trailers} />
      <Route path="/trailers/:id" component={TrailerDetail} />
      <Route path="/trucks/:id" component={TruckDetail} />
      <Route path="/individual-listings/:id" component={IndividualListingDetail} />
      <Route path="/dealer/profile/:id" component={DealerProfile} />
      <Route path="/user/profile/:email" component={UserProfile} />
      <Route path="/dealer/login" component={DealerLogin} />
      <Route path="/dealer/signup" component={DealerSignup} />
      <Route path="/dealer/signup/success" component={DealerSignupSuccess} />
      <Route path="/dealer/subscribe" component={DealerSubscribe} />
      <Route path="/dealer/subscription-success" component={DealerSubscriptionSuccess} />
      <Route path="/dealer/dashboard">
        {() => (
          <DealerProtectedRoute>
            <DealerDashboard />
          </DealerProtectedRoute>
        )}
      </Route>
      <Route path="/dealer/trucks/new">
        {() => (
          <DealerProtectedRoute>
            <AddTruck />
          </DealerProtectedRoute>
        )}
      </Route>
      <Route path="/dealer/trucks/:id/edit">
        {() => (
          <DealerProtectedRoute>
            <EditTruck />
          </DealerProtectedRoute>
        )}
      </Route>
      <Route path="/dealer/trailers/:id/edit">
        {() => (
          <DealerProtectedRoute>
            <EditTrailer />
          </DealerProtectedRoute>
        )}
      </Route>
      <Route path="/sell" component={Sell} />
      <Route path="/sell/individual" component={SellIndividual} />
      <Route path="/sell-individual" component={SellIndividual} />
      <Route path="/finance-calculator" component={FinanceCalculator} />

      <Route path="/pricing" component={Pricing} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/subscription-success" component={SubscriptionSuccess} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/saved" component={SavedListings} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/edit-individual-listing/:id" component={EditIndividualListing} />
      <Route path="/help" component={Help} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dealer/forgot-password" component={DealerForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        {() => (
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const authValue = useAuthProvider();
  const userAuthValue = useUserAuthProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue}>
        <UserAuthContext.Provider value={userAuthValue}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserAuthContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
