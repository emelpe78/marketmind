import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAiStatus } from "../../app/composables/useAiStatus";
import { AI_ACTIONS } from "shared/ai-status";

describe("useAiStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows status bar during AI action and clears afterward", async () => {
    const { state, runWithAiStatus } = useAiStatus();

    const promise = runWithAiStatus("prompt-generate", async () => {
      expect(state.active).toBe(true);
      expect(state.message).toBe(AI_ACTIONS["prompt-generate"].steps[0]);
      await Promise.resolve();
      return "ok";
    });

    await promise;

    expect(state.progress).toBe(100);
    expect(state.message).toBe("Fertig");

    await vi.advanceTimersByTimeAsync(500);

    expect(state.active).toBe(false);
    expect(state.actionId).toBeNull();
  });

  it("rotates step messages for multi-step actions", async () => {
    const { state, runWithAiStatus } = useAiStatus();

    let resolveFn!: () => void;
    const blocked = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });

    const promise = runWithAiStatus("flipping-analyze", async () => {
      await blocked;
      return null;
    });

    expect(state.message).toBe("Anzeige wird geladen…");

    await vi.advanceTimersByTimeAsync(4500);
    expect(state.message).toBe("Marktpreise werden ermittelt…");

    resolveFn();
    await promise;
    await vi.advanceTimersByTimeAsync(500);

    expect(state.active).toBe(false);
  });
});
