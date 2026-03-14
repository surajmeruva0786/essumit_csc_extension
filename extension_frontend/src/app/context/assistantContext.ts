// assistantContext.ts - Store current application context for AI chat

import type { AssistantContext } from '../api/chatApi';

let currentContext: AssistantContext = {};

export function setAssistantContext(ctx: AssistantContext): void {
  currentContext = { ...ctx };
}

export function getAssistantContext(): AssistantContext {
  return { ...currentContext };
}

export function clearAssistantContext(): void {
  currentContext = {};
}
