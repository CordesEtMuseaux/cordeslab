import type { CalcInput } from "../shared/types";

export type Project = {
  id: string;
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  input: CalcInput;
};

type ProjectUsage = {
  totalCreated: number;
};

const KEY = "cordeslab:projects:v1";
const USAGE_KEY = "cordeslab:projects:usage:v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadProjectUsage(): ProjectUsage {
  const parsed = safeParse<ProjectUsage>(localStorage.getItem(USAGE_KEY));

  if (
    parsed &&
    typeof parsed.totalCreated === "number" &&
    Number.isFinite(parsed.totalCreated) &&
    parsed.totalCreated >= 0
  ) {
    return parsed;
  }

  // Migration douce : si aucun compteur n’existe encore,
  // on initialise au nombre de projets déjà présents.
  return {
    totalCreated: loadProjects().length,
  };
}

function saveProjectUsage(usage: ProjectUsage) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

export function loadProjects(): Project[] {
  const parsed = safeParse<Project[]>(localStorage.getItem(KEY));
  if (!parsed || !Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (p) =>
        p &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        (p as any).input
    )
    .sort((a, b) =>
      (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt)
    );
}

export function saveProjects(projects: Project[]) {
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function getProjectById(projectId: string): Project | null {
  const projects = loadProjects();
  return projects.find((p) => p.id === projectId) ?? null;
}

export function addProject(
  project: Omit<Project, "id" | "createdAt" | "updatedAt">
): Project {
  const projects = loadProjects();
  const usage = loadProjectUsage();
  const created = nowIso();

  const p: Project = {
    id: uid(),
    name: project.name,
    createdAt: created,
    updatedAt: created,
    input: project.input,
  };

  projects.unshift(p);
  saveProjects(projects);

  saveProjectUsage({
    totalCreated: usage.totalCreated + 1,
  });

  return p;
}

export function deleteProject(projectId: string) {
  const projects = loadProjects().filter((p) => p.id !== projectId);
  saveProjects(projects);

  // Important :
  // on NE décrémente PAS totalCreated.
  // Atelier = quota de créations cumulées.
}

export function updateProject(
  projectId: string,
  patch: Partial<Pick<Project, "name" | "input">>
) {
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === projectId);
  if (idx === -1) return;

  const prev = projects[idx];
  const next: Project = {
    ...prev,
    ...patch,
    updatedAt: nowIso(),
  };

  projects[idx] = next;
  saveProjects(projects);
}

export function countProjects(): number {
  return loadProjects().length;
}

export function countProjectsCreated(): number {
  return loadProjectUsage().totalCreated;
}