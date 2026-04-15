import { useAppSelector } from './store/hooks';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { VideoDetailPage } from './pages/VideoDetailPage';

export default function App() {
  const route = useAppSelector((s) => s.route);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      <main>
        {route.name === 'home' && <HomePage />}
        {route.name === 'video' && <VideoDetailPage />}
        {route.name === 'not-found' && (
          <div className="text-center py-20">
            <h1 className="sr-only">Page not found</h1>
            <p className="text-ink-secondary text-sm">Page not found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
