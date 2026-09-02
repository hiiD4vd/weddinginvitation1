export const INTRO_FAILSAFE_MS = 9_000;

const TERMINAL_INTRO_EVENTS = new Set(["ended", "error", "stalled", "abort"]);

export function isTerminalIntroEvent(eventType: string) {
  return TERMINAL_INTRO_EVENTS.has(eventType);
}

export function shouldUnlockScroll({
  started,
  gone,
}: {
  started: boolean;
  gone: boolean;
}) {
  return started || gone;
}
