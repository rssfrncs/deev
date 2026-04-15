import type React from 'react';

type MCElement = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  autoplay?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  slot?: string;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'hls-video': MCElement;
    }
  }
}
