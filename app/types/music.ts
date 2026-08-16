export interface Track {
  id: string;
  title: string;
  artist: string;
  film?: string;
  year?: string;
  duration: number; // seconds
  videoId: string;
}

export interface Playlist {
  id: string;
  name: string;
  tagline: string;
  tracks: Track[];
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'ended' | 'error';
