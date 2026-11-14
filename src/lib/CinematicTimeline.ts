// src/lib/CinematicTimeline.ts
//
// Owns the narration <audio> element and a 0..1 `progress` value that the camera follows.
// - If the audio plays: progress = audio.currentTime / audio.duration  (camera stays locked to the voice)
// - If the file is missing / blocked: progress runs on a clock using `fallbackDuration`
//   (captions + camera still work, so you can build everything before recording the audio).

export type TimelineStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface TimelineSnapshot {
  status: TimelineStatus;
  progress: number;
  muted: boolean;
  /** Browser refused to start audio (autoplay policy). */
  audioBlocked: boolean;
  /** File missing / unsupported. Captions-only mode. */
  audioFailed: boolean;
  /** Waiting for the audio file to start. */
  loading: boolean;
}

export class CinematicTimeline {
  status: TimelineStatus = 'idle';
  progress = 0;
  muted = false;

  private audio: HTMLAudioElement | null = null;
  private url?: string;
  private fallbackDuration = 90;
  private clock = 0;
  private waited = 0;
  private audioBlocked = false;
  private audioFailed = false;

  /** Call this directly inside a click handler so the browser allows autoplay. */
  start(url?: string, fallbackDuration = 90) {
    this.stop();
    this.url = url;
    this.fallbackDuration = fallbackDuration;
    this.clock = 0;
    this.waited = 0;
    this.progress = 0;
    this.audioBlocked = false;
    this.audioFailed = !url;
    this.status = 'playing';

    if (url) {
      const a = new Audio(url);
      a.preload = 'auto';
      a.muted = this.muted;
      a.addEventListener('error', () => {
        this.audioFailed = true;
      });
      a.addEventListener('ended', () => {
        this.progress = 1;
        this.status = 'ended';
      });
      this.audio = a;
      a.play().catch((err) => {
        // NotAllowedError = autoplay blocked; anything else = bad file
        if (err?.name === 'NotAllowedError') this.audioBlocked = true;
        else this.audioFailed = true;
      });
    }
  }

  restart() {
    this.start(this.url, this.fallbackDuration);
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.status = 'idle';
    this.progress = 0;
  }

  pause() {
    if (this.status !== 'playing') return;
    this.status = 'paused';
    this.audio?.pause();
  }

  resume() {
    if (this.status !== 'paused') return;
    this.status = 'playing';
    if (this.audio && !this.audioFailed && !this.audioBlocked) this.audio.play().catch(() => {});
  }

  toggle() {
    if (this.status === 'playing') {
      this.pause();
    } else {
      this.resume();
    }
  }

  /** Jump to a normalized position (0..1) along the timeline. */
  seek(targetProgress: number) {
    const p = Math.max(0, Math.min(1, targetProgress));
    this.progress = p;
    const a = this.audio;
    if (a && !this.audioFailed && isFinite(a.duration) && a.duration > 0) {
      a.currentTime = p * a.duration;
      this.clock = a.currentTime;
    } else {
      this.clock = p * this.fallbackDuration;
    }
    if (p >= 1) {
      this.status = 'ended';
      a?.pause();
    } else if (this.status === 'ended' || this.status === 'idle') {
      this.status = 'paused';
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.audio) this.audio.muted = m;
  }

  /** Lets the user start sound after the browser blocked autoplay. */
  enableAudio() {
    if (!this.audio) return;
    this.audio.currentTime = this.clock;
    this.audio
      .play()
      .then(() => {
        this.audioBlocked = false;
      })
      .catch(() => {
        this.audioFailed = true;
      });
  }

  /** Called every frame by the camera controller. */
  update(delta: number) {
    if (this.status !== 'playing') return;
    const a = this.audio;

    if (a && !this.audioFailed && !this.audioBlocked) {
      const ready = a.readyState >= 2 && isFinite(a.duration) && a.duration > 0 && a.currentTime > 0;
      if (ready) {
        this.progress = Math.min(1, a.currentTime / a.duration);
        this.clock = a.currentTime;
        this.waited = 0;
        return;
      }
      // audio still buffering: hold the camera so image and voice stay in sync (give up after 8s)
      this.waited += delta;
      if (this.waited < 8) return;
      this.audioFailed = true;
    }

    this.clock += delta;
    this.progress = Math.min(1, this.clock / this.fallbackDuration);
    if (this.progress >= 1) this.status = 'ended';
  }

  snapshot(): TimelineSnapshot {
    return {
      status: this.status,
      progress: this.progress,
      muted: this.muted,
      audioBlocked: this.audioBlocked,
      audioFailed: this.audioFailed,
      loading:
        this.status === 'playing' &&
        !!this.audio &&
        !this.audioFailed &&
        !this.audioBlocked &&
        this.progress === 0,
    };
  }
}