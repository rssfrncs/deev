export type Route =
  | { name: 'home'; query: { search?: string; tag?: string } }
  | { name: 'video'; params: { id: string } }
  | { name: 'not-found' };

export function matchRoute(pathname: string, search: string): Route {
  if (pathname === '/') {
    const p = new URLSearchParams(search);
    return {
      name: 'home',
      query: {
        search: p.get('search') ?? undefined,
        tag: p.get('tag') ?? undefined,
      },
    };
  }

  const videoMatch = pathname.match(/^\/video\/([^/]+)$/);
  if (videoMatch) {
    return { name: 'video', params: { id: decodeURIComponent(videoMatch[1]) } };
  }

  return { name: 'not-found' };
}

export function buildUrl(route: Extract<Route, { name: 'home' | 'video' }>): string {
  if (route.name === 'video') return `/video/${route.params.id}`;
  const p = new URLSearchParams();
  if (route.query.search) p.set('search', route.query.search);
  if (route.query.tag) p.set('tag', route.query.tag);
  const qs = p.toString();
  return qs ? `/?${qs}` : '/';
}
