import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AboutPage from "./pages/AboutPage";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import OwnerDashboard from "./pages/OwnerDashboard";
import ProfilePage from "./pages/ProfilePage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import ResourcesPage from "./pages/ResourcesPage";

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !isLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Navbar userProfile={userProfile ?? null} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <ProfileSetupModal open={showProfileSetup} />
      <Toaster richColors position="top-right" />
    </div>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const propertyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/property/$id",
  component: PropertyDetailPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: OwnerDashboard,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const resourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/resources",
  component: ResourcesPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  exploreRoute,
  propertyDetailRoute,
  dashboardRoute,
  profileRoute,
  aboutRoute,
  resourcesRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
