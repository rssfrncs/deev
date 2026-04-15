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
  '--media-control-hover-background': 'rgba(0,0,0,0.08)',
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

type Props = { variant: 'card'; onReady?: () => void } | { variant: 'detail' };

export function HlsPlayer(props: Props) {
  const elementRef = useRef<Element | null>(null);

  const cardRef = useCallback((el: Element | null) => {
    if (el) {
      elementRef.current = el;
      (el as any).config = { startLevel: 0, capLevelToPlayerSize: true };
      if (props.variant === 'card' && props.onReady) {
        el.addEventListener('canplay', props.onReady, { once: true });
      }
      (el as any).src = DEMO_HLS_SRC;
    } else if (elementRef.current) {
      (elementRef.current as any).src = '';
      elementRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (props.variant === 'card') {
    return (
      <hls-video
        ref={cardRef}
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

  return (
    <MediaController style={{ ...theme, width: '100%', height: '100%' }}>
      <hls-video slot="media" src={DEMO_HLS_SRC} playsinline style={{ width: '100%', height: '100%', objectFit: 'cover' } as React.CSSProperties} />
      <MediaControlBar style={controlBarStyle}>
        <MediaPlayButton style={{ padding: '0 8px' }} />
        <MediaTimeDisplay />
        <MediaTimeRange />
        <MediaDurationDisplay />
        <MediaMuteButton style={{ padding: '0 8px' }} />
        <MediaVolumeRange />
        <MediaFullscreenButton />
      </MediaControlBar>
    </MediaController>
  );
}
