export type ProjectHistorySnapshot = {
  id: string;
  createdAt: number;
  name: string;
  input: {
    calcName?: string;
    productModelId: string;
    lengthCm: number;
    nodeId: string;
    diameterMm: 3 | 4;
    colorCount: 1 | 2 | 3 | 4;
    startColor: 1 | 2 | 3 | 4;
    maxSecurity: boolean;
    roundingMode: "none" | "cm" | "5cm" | "10cm";
    unitDisplay: "cm" | "m";
    colorsHex: string[];
  };
};

export type ProjectHistoryEntry = {
  projectId: string;
  revisions: ProjectHistorySnapshot[];
};

const STORAGE_KEY = "cordeslab_project_history_v1";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readAll(): ProjectHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(data: ProjectHistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadProjectHistory(): ProjectHistoryEntry[] {
  return readAll();
}

export function getProjectHistory(projectId: string): ProjectHistorySnapshot[] {
  const all = readAll();
  const item = all.find((x) => x.projectId === projectId);
  if (!item) return [];
  return [...item.revisions].sort((a, b) => b.createdAt - a.createdAt);
}

export function addProjectRevision(
  projectId: string,
  revision: Omit<ProjectHistorySnapshot, "id" | "createdAt">
) {
  const all = readAll();
  const index = all.findIndex((x) => x.projectId === projectId);

  const nextRevision: ProjectHistorySnapshot = {
    id: uid(),
    createdAt: Date.now(),
    name: revision.name,
    input: revision.input,
  };

  if (index === -1) {
    all.unshift({
      projectId,
      revisions: [nextRevision],
    });
  } else {
    all[index].revisions.unshift(nextRevision);
    all[index].revisions = all[index].revisions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50);
  }

  writeAll(all);
}

export function clearProjectHistory(projectId: string) {
  const all = readAll().filter((x) => x.projectId !== projectId);
  writeAll(all);
}

export function deleteProjectRevision(projectId: string, revisionId: string) {
  const all = readAll();
  const index = all.findIndex((x) => x.projectId === projectId);
  if (index === -1) return;

  all[index].revisions = all[index].revisions.filter((r) => r.id !== revisionId);

  if (all[index].revisions.length === 0) {
    all.splice(index, 1);
  }

  writeAll(all);
}