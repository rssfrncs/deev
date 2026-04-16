import { useCallback, useRef } from 'react';
import 'hls-video-element';
import {
  MediaController,
  MediaControlBar,
  MediaPlayButton,
  MediaMuteButton,
  MediaVolumeRange,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaDurationDisplay,
  MediaFullscreenButton,
} from 'media-chrome/react';

export const DEMO_HLS_SRC =
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8';

const theme = {
  '--media-primary-color': '#96ff1a',
  '--media-secondary-color': 'rgba(0,0,0,0.1)',
  '--media-background-color': 'transparent',
  '--media-control-background': 'transparent',
  '--media-control-hover-background': 'transparent',
  '--media-icon-color': '#1a1a1a',
  '--media-text-color': '#1a1a1a',
  '--media-font-family': 'SwissNow, ui-sans-serif, system-ui, -apple-system, sans-serif',
  '--media-font-size': '12px',
  '--media-range-thumb-background': '#96ff1a',
  '--media-range-bar-color': '#96ff1a',
  '--media-range-track-background': 'rgba(0,0,0,0.15)',
  '--media-time-range-buffered-color': 'rgba(0,0,0,0.1)',
} as React.CSSProperties;

const controlBarStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(12px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.8)',
  borderRadius: '10px',
  margin: '0 8px 8px',
  border: '1px solid rgba(255,255,255,0.6)',
};

type SharedProps = { onReady?: () => void };

export function HlsPlayerCard({ onReady }: SharedProps) {
  const elRef = useRef<Element | null>(null);

  const ref = useCallback((el: Element | null) => {
    if (el) {
      elRef.current = el;
      (el as any).config = { startLevel: 0, capLevelToPlayerSize: true };
      if (onReady) el.addEventListener('canplay', onReady, { once: true });
      (el as any).src = DEMO_HLS_SRC;
    } else if (elRef.current) {
      (elRef.current as any).src = '';
      elRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <hls-video
      ref={ref}
      autoplay
      muted
      playsinline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
      } as React.CSSProperties}
    />
  );
}

export function HlsPlayerDetail({ onReady }: SharedProps) {
  const elRef = useRef<Element | null>(null);

  const ref = useCallback((el: Element | null) => {
    if (el) {
      elRef.current = el;
      if (onReady) el.addEventListener('canplay', onReady, { once: true });
      (el as any).src = DEMO_HLS_SRC;
    } else if (elRef.current) {
      (elRef.current as any).src = '';
      elRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MediaController style={{ ...theme, width: '100%', height: '100%' }}>
      <hls-video autoplay ref={ref} slot="media" playsinline style={{ width: '100%', height: '100%', objectFit: 'cover' } as React.CSSProperties} />
      <MediaControlBar style={controlBarStyle}>
        <MediaPlayButton style={{ padding: '0 8px' }} />
        <MediaTimeDisplay style={{ cursor: 'default', userSelect: 'none' }} />
        <MediaTimeRange />
        <MediaDurationDisplay style={{ cursor: 'default', userSelect: 'none' }} />
        <MediaMuteButton style={{ padding: '0 8px' }} />
        <MediaVolumeRange />
        <MediaFullscreenButton style={{ padding: '0 8px' }} />
      </MediaControlBar>
    </MediaController>
  );
}
