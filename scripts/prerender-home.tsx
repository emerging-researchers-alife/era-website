import { renderToString } from 'react-dom/server';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { router } from '../src/router';
import poster from '../src/assets/nca/lizard-poster.png';

/** A readable homepage before JS, replaced atomically by the eager client route. */
export async function prerenderHome(posterUrl: string): Promise<string> {
  router.update({ history: createMemoryHistory({ initialEntries: ['/'] }) });
  await router.load();
  return renderToString(<RouterProvider router={router} />).replaceAll(poster, posterUrl);
}
