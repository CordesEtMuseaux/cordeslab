const KEY = "cordeslab:openProjectId:v1";

/**
 * Set the project to open on next visit of NewCalc.
 */
export function setOpenProjectIntent(projectId: string) {
  localStorage.setItem(KEY, projectId);
}

/**
 * Read and clear (one-shot).
 */
export function popOpenProjectIntent(): string | null {
  const id = localStorage.getItem(KEY);
  if (id) localStorage.removeItem(KEY);
  return id;
}

/**
 * Read without clearing (rarely needed).
 */
export function peekOpenProjectIntent(): string | null {
  return localStorage.getItem(KEY);
}

/**
 * Clear explicitly.
 */
export function clearOpenProjectIntent() {
  localStorage.removeItem(KEY);
}