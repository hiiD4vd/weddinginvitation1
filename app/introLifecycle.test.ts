import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  INTRO_FAILSAFE_MS,
  isTerminalIntroEvent,
  shouldUnlockScroll,
} from "./introLifecycle.ts";

describe("intro lifecycle", () => {
  it("unlocks scrolling as soon as the guest opens the invitation", () => {
    assert.equal(shouldUnlockScroll({ started: true, gone: false }), true);
  });

  it("keeps scrolling locked only while the unopened cover is visible", () => {
    assert.equal(shouldUnlockScroll({ started: false, gone: false }), false);
  });

  it("releases the cover for every terminal media outcome", () => {
    for (const event of ["ended", "error", "stalled", "abort"]) {
      assert.equal(isTerminalIntroEvent(event), true, event);
    }
  });

  it("does not release the cover for ordinary progress events", () => {
    assert.equal(isTerminalIntroEvent("timeupdate"), false);
  });

  it("uses a bounded failsafe so a stuck video cannot trap the page", () => {
    assert.ok(INTRO_FAILSAFE_MS >= 4_000);
    assert.ok(INTRO_FAILSAFE_MS <= 10_000);
  });
});
