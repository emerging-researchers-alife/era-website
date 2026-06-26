import { createRouter, createRootRoute, createRoute, notFound } from '@tanstack/react-router';
import { lazy } from 'react';
import { Layout } from './components/layout';

// Base path for custom domain (empty string for root)
export const BASE_PATH = '';

// Lazy load page components
const HomePage = lazy(() => import('./routes/Home'));
const AboutPage = lazy(() => import('./routes/About'));
const CommunityPage = lazy(() => import('./routes/Community'));
const EventsPage = lazy(() => import('./routes/Events'));
const EventModal = lazy(() => import('./components/events/EventModal'));
const ResourcesPage = lazy(() => import('./routes/Resources'));
const ArticlePage = lazy(() => import('./routes/Article'));
const NotFoundPage = lazy(() => import('./routes/NotFound'));

// Create root route with Layout
const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: NotFoundPage,
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/community',
  component: CommunityPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const eventRoute = createRoute({
  getParentRoute: () => eventsRoute,
  path: '$slug',
  component: EventModal,
});

const resourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resources',
  component: ResourcesPage,
});

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resources/$slug',
  component: ArticlePage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  communityRoute,
  eventsRoute.addChildren([eventRoute]),
  resourcesRoute,
  articleRoute,
]);

// Create and export the router
export const router = createRouter({
  routeTree,
  basepath: BASE_PATH,
  defaultPreloadStaleTime: 0,
  // Use TanStack's built-in scroll restoration
  scrollRestoration: true,
});

// Type declarations for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
