import { reactive, readonly } from "vue";
import {
  AI_ACTIONS,
  type AiActionId,
  type AiStatusState,
} from "shared/ai-status";

const state = reactive<AiStatusState>({
  active: false,
  message: "",
  progress: null,
  actionId: null,
});

let stepTimer: ReturnType<typeof setInterval> | null = null;
let progressTimer: ReturnType<typeof setInterval> | null = null;
let finishTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (stepTimer) {
    clearInterval(stepTimer);
    stepTimer = null;
  }
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (finishTimer) {
    clearTimeout(finishTimer);
    finishTimer = null;
  }
}

function beginAction(actionId: AiActionId) {
  clearTimers();
  const action = AI_ACTIONS[actionId];
  state.active = true;
  state.actionId = actionId;
  state.message = action.steps[0] ?? action.label;
  state.progress = action.steps.length === 1 ? null : 8;

  if (action.steps.length > 1) {
    let stepIndex = 0;
    stepTimer = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, action.steps.length - 1);
      state.message = action.steps[stepIndex] ?? action.label;
      state.progress = Math.min(
        88,
        Math.round(((stepIndex + 1) / action.steps.length) * 85),
      );
    }, action.stepIntervalMs ?? 4000);
  }

  progressTimer = setInterval(() => {
    if (state.progress == null || state.progress >= 90) return;
    state.progress = Math.min(90, state.progress + 2);
  }, 900);
}

function finishAction() {
  clearTimers();
  state.progress = 100;
  state.message = "Fertig";
  finishTimer = setTimeout(() => {
    state.active = false;
    state.message = "";
    state.progress = null;
    state.actionId = null;
  }, 450);
}

export function useAiStatus() {
  async function runWithAiStatus<T>(
    actionId: AiActionId,
    fn: () => Promise<T>,
  ): Promise<T> {
    beginAction(actionId);
    try {
      return await fn();
    } finally {
      finishAction();
    }
  }

  return {
    state: readonly(state),
    runWithAiStatus,
  };
}
