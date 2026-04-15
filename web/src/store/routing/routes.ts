export type Route =
  | { name: 'home'; query: { search?: string; tags?: string[]; sort?: string } }
  | { name: 'video'; params: { id: string } }
  | { name: 'not-found' };

export function matchRoute(pathname: string, search: string): Route {
  if (pathname === '/') {
    const p = new URLSearchParams(search);
    const tags = p.getAll('tag');
    return {
      name: 'home',
      query: {
        search: p.get('search') ?? undefined,
        tags: tags.length ? tags : undefined,
        sort: p.get('sort') ?? undefined,
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
  route.query.tags?.forEach((t) => p.append('tag', t));
  if (route.query.sort && route.query.sort !== 'desc') p.set('sort', route.query.sort);
  const qs = p.toString();
  return qs ? `/?${qs}` : '/';
}
