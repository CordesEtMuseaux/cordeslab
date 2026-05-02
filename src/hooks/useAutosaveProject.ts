import { useEffect, useMemo, useRef, useState } from "react";
import { loadProjects, updateProject, type Project } from "../utils/projectsStorage";

/**
 * Autosave d'un projet par id.
 * - debounce (par défaut 800ms)
 * - statut: "saved" | "dirty" | "saving" | "error"
 *
 * Tu lui donnes: projectId + input (l'objet que tu édites)
 */
export function useAutosaveProject<TInput extends Project["input"]>(
  projectId: string | null,
  input: TInput,
  opts?: { debounceMs?: number }
) {
  const debounceMs = opts?.debounceMs ?? 800;

  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">(
    "saved"
  );

  // Snapshot "dernier contenu sauvegardé" pour détecter dirty
  const lastSavedJsonRef = useRef<string>("");
  const timerRef = useRef<number | null>(null);
  const savingRef = useRef(false);

  // Si l'input change -> json stable pour comparer
  const inputJson = useMemo(() => JSON.stringify(input), [input]);

  // Init lastSavedJson quand on a un projet valide (montage / changement d'id)
  useEffect(() => {
    if (!projectId) return;

    const p = loadProjects().find((x) => x.id === projectId);
    if (!p) return;

    lastSavedJsonRef.current = JSON.stringify(p.input);
    setStatus("saved");
  }, [projectId]);

  // Détecte dirty + déclenche autosave
  useEffect(() => {
    if (!projectId) return;

    const isDirty = inputJson !== lastSavedJsonRef.current;

    if (!isDirty) {
      // si on revient à l'état sauvegardé
      if (status !== "saving") setStatus("saved");
      return;
    }

    setStatus("dirty");

    // debounce save
    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      // éviter un double save concurrent
      if (savingRef.current) return;

      savingRef.current = true;
      setStatus("saving");

      try {
        updateProject(projectId, { input });
        lastSavedJsonRef.current = inputJson;
        setStatus("saved");
      } catch (e) {
        console.error(e);
        setStatus("error");
      } finally {
        savingRef.current = false;
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, inputJson, debounceMs]);

  // Pour forcer un save immédiat (ex: avant navigation)
  function flushSave() {
    if (!projectId) return;

    const isDirty = inputJson !== lastSavedJsonRef.current;
    if (!isDirty) return;

    try {
      setStatus("saving");
      updateProject(projectId, { input });
      lastSavedJsonRef.current = inputJson;
      setStatus("saved");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  return { status, flushSave };
}