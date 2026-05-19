import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

import CobraPreview, { KnotPreviewHandle } from "../components/Debutant/CobraPreview";
import FishtailPreview from "../components/Debutant/FishtailPreview";
import LadderRackPreview from "../components/Debutant/LadderRackPreview";
import SnakeKnotPreview from "../components/Debutant/SnakeKnotPreview";
import SpiralPreview from "../components/Debutant/SpiralPreview";
import SquareKnotPreview from "../components/Debutant/SquareKnotPreview";
import TrilobitePreview from "../components/Intermediaire/TrilobitePreview";
import CrownSinnetPreview from "../components/Intermediaire/CrownSinnetPreview";
import TressageRondPreview from "../components/Intermediaire/TressageRondPreview";
import ViperWeavePreview from "../components/Intermediaire/ViperWeavePreview";
import KingCobraPreview from "../components/Avance/KingCobraPreview";
import SanctifiedPreview from "../components/Avance/SanctifiedPreview";
import SharkJawbonePreview from "../components/Avance/SharkJawbonePreview";
import AztecSunBarPreview from "../components/Expert/AztecSunBarPreview";
import CelticBarPreview from "../components/Expert/CelticBarPreview";
import MadMaxPreview from "../components/Expert/MadMaxPreview";

import { getUserPlan } from "../App";

type Plan = "Atelier" | "Creator" | "Pro";
const USER_PLAN: Plan = getUserPlan();

const COLORS_DATABASE = [
  { name: "Noir Satin",     hex: "#1F1F1F" },
  { name: "Blanc Soie",     hex: "#FFFFFF" },
  { name: "Néon Turquoise", hex: "#00E5EE" },
  { name: "Rouge Impérial", hex: "#ED2939" },
  { name: "Or",             hex: "#FFD700" },
  { name: "Forêt Profonde", hex: "#013220" },
  { name: "Caramel",        hex: "#C68E17" },
  { name: "Bleu Royal",     hex: "#002366" },
  { name: "Orange",         hex: "#FF8C00" },
  { name: "Gris",           hex: "#808080" },
  { name: "Arc-en-ciel",    hex: "url(#rainbowGrad)" },
];

const ACCESSORIES_CONFIG = {
  COLLIER: { label: "Collier", icon: "🐕", lock: null,      models: ["Boucle plastique", "Boucle métal", "Martingale", "Adaptateur Biothane"] },
  POIGNEE: { label: "Poignée", icon: "✋", lock: "Creator", models: ["Simple", "Confort"] },
  LAISSE:  { label: "Laisse",  icon: "🦮", lock: "Pro",     models: ["1m20", "Multiposition sans poignée", "Multiposition avec poignée"] },
  HARNAIS: { label: "Harnais", icon: "🎗️", lock: "Pro",    models: ["En Y", "En H"] },
  JOUETS:  { label: "Jouets",  icon: "🎾", lock: "Pro",     models: ["Balle", "Tug"] },
} as const;

type AccessoryKey = keyof typeof ACCESSORIES_CONFIG;
type LengthUnit = "cm" | "m" | "in";
type RopeSize = "3mm" | "4mm";
type HarnessSize = "XS" | "S" | "M" | "L" | "XL";

const HARNESS_SIZES: { value: HarnessSize; label: string; lengthCm: number; poitrail: string }[] = [
  { value: "XS", label: "XS", lengthCm: 35, poitrail: "30-40 cm · 1-5 kg" },
  { value: "S",  label: "S",  lengthCm: 46, poitrail: "40-52 cm · 5-10 kg" },
  { value: "M",  label: "M",  lengthCm: 58, poitrail: "52-65 cm · 10-20 kg" },
  { value: "L",  label: "L",  lengthCm: 72, poitrail: "65-80 cm · 20-35 kg" },
  { value: "XL", label: "XL", lengthCm: 90, poitrail: "80-100 cm · 35+ kg" },
];

const HARNESS_RECOMMENDED_KNOTS = ["Cobra", "Fishtail", "TressageRond", "ViperWeave", "KingCobra"];

const UNIT_OPTIONS: { value: LengthUnit; label: string }[] = [
  { value: "cm", label: "cm" },
  { value: "m",  label: "mètre" },
  { value: "in", label: "pouces" },
];

const KNOTS_REGISTRY = [
  { id: "Cobra",        name: "Cobra",        difficulty: "Débutant",      component: CobraPreview,        factor: 21, order: 1, is3D: true, baseMinutes: 45,  calibrated: true  },
  { id: "Fishtail",     name: "Fishtail",     difficulty: "Débutant",      component: FishtailPreview,     factor: 18, order: 2, is3D: true, baseMinutes: 55,  calibrated: true  },
  { id: "LadderRack",   name: "Ladder Rack",  difficulty: "Débutant",      component: LadderRackPreview,   factor: 20, order: 3, is3D: true, baseMinutes: 50,  calibrated: false },
  { id: "SnakeKnot",    name: "Snake Knot",   difficulty: "Débutant",      component: SnakeKnotPreview,    factor: 14, order: 4, is3D: true, baseMinutes: 35,  calibrated: false },
  { id: "Spiral",       name: "Spiral",       difficulty: "Débutant",      component: SpiralPreview,       factor: 16, order: 5, is3D: true, baseMinutes: 40,  calibrated: false },
  { id: "SquareKnot",   name: "Square Knot",  difficulty: "Débutant",      component: SquareKnotPreview,   factor: 18, order: 6, is3D: true, baseMinutes: 45,  calibrated: false },
  { id: "Trilobite",    name: "Trilobite",    difficulty: "Intermédiaire", component: TrilobitePreview,    factor: 24, order: 1, is3D: true, baseMinutes: 70,  calibrated: false },
  { id: "CrownSinnet",  name: "Crown Sinnet", difficulty: "Intermédiaire", component: CrownSinnetPreview,  factor: 16, order: 2, is3D: true, baseMinutes: 60,  calibrated: false },
  { id: "TressageRond", name: "Tressage Rond",difficulty: "Intermédiaire", component: TressageRondPreview, factor: 14, order: 3, is3D: true, baseMinutes: 55,  calibrated: true  },
  { id: "ViperWeave",   name: "Viper Weave",  difficulty: "Intermédiaire", component: ViperWeavePreview,   factor: 22, order: 4, is3D: true, baseMinutes: 65,  calibrated: false },
  { id: "KingCobra",    name: "King Cobra",   difficulty: "Avancé",        component: KingCobraPreview,    factor: 35, order: 1, is3D: true, baseMinutes: 90,  calibrated: false },
  { id: "Sanctified",   name: "Sanctified",   difficulty: "Avancé",        component: SanctifiedPreview,   factor: 28, order: 2, is3D: true, baseMinutes: 80,  calibrated: false },
  { id: "SharkJawbone", name: "Shark Jawbone",difficulty: "Avancé",        component: SharkJawbonePreview, factor: 30, order: 3, is3D: true, baseMinutes: 85,  calibrated: false },
  { id: "AztecSunBar",  name: "Aztec Sun Bar",difficulty: "Expert",        component: AztecSunBarPreview,  factor: 40, order: 1, is3D: true, baseMinutes: 105, calibrated: false },
  { id: "CelticBar",    name: "Celtic Bar",   difficulty: "Expert",        component: CelticBarPreview,    factor: 38, order: 2, is3D: true, baseMinutes: 100, calibrated: false },
  { id: "MadMax",       name: "Mad Max",      difficulty: "Expert",        component: MadMaxPreview,       factor: 45, order: 3, is3D: true, baseMinutes: 120, calibrated: false },
] as const;

const STORAGE_KEYS = {
  PROJECTS:     "cordeslab_projects",
  DASHBOARD:    "cordeslab_dashboard_projects",
  HISTORY:      "cordeslab_history",
  LAST_PROJECT: "cordeslab_last_project",
} as const;

const DIFFICULTIES = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

const DIFFICULTY_TOOLTIPS: Record<string, string> = {
  "Débutant":      "Nœuds simples, idéaux pour commencer. Peu de brins, gestes répétitifs.",
  "Intermédiaire": "Nœuds plus élaborés, nécessitent de la pratique et de la concentration.",
  "Avancé":        "Techniques complexes, plusieurs couches de tressage. Expérience recommandée.",
  "Expert":        "Nœuds très techniques, longs à réaliser. Réservés aux tresseurs confirmés.",
};

const toCm       = (v: number, u: LengthUnit) => u === "m" ? v * 100 : u === "in" ? v * 2.54 : v;
const fromCm     = (v: number, u: LengthUnit) => u === "m" ? v / 100 : u === "in" ? v / 2.54 : v;
const roundDisp  = (v: number, u: LengthUnit) => u === "m" ? +v.toFixed(2) : u === "in" ? +v.toFixed(1) : Math.round(v);
const fmtLen     = (cm: number, u: LengthUnit) => `${roundDisp(fromCm(cm, u), u)} ${u}`;
const equivUnit  = (u: LengthUnit): LengthUnit => u === "cm" ? "in" : "cm";
const fmtDur     = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}`;
const fmtTime    = (s: number) => `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m ${String(s % 60).padStart(2, "0")}s`;

const isAccLocked  = (lock: string | null) => !lock || (USER_PLAN as string) === "Pro" ? false : (USER_PLAN as string) === "Creator" ? lock === "Pro" : true;
const isKnotLocked = (order: number) => (USER_PLAN as string) === "Pro" ? false : (USER_PLAN as string) === "Creator" ? order > 3 : order > 2;

const getRefLen = (type: AccessoryKey, model: string) => {
  if (type === "LAISSE") {
    if (model === "Multiposition avec poignée") return 245;
    if (model === "Multiposition sans poignée") return 220;
    return 120;
  }
  if (type === "POIGNEE") return model === "Confort" ? 35 : 25;
  if (type === "HARNAIS") return model === "En Y" ? 70 : 80;
  if (type === "JOUETS")  return model === "Tug" ? 35 : 20;
  return 35;
};

const getTimeMult = (type: AccessoryKey, model: string) => {
  if (type === "LAISSE") {
    if (model === "Multiposition avec poignée") return 1.55;
    if (model === "Multiposition sans poignée") return 1.45;
    return 1.2;
  }
  if (type === "POIGNEE") return model === "Confort" ? 1.1 : 0.9;
  if (type === "HARNAIS") return model === "En Y" ? 1.35 : 1.45;
  if (type === "JOUETS")  return model === "Tug" ? 0.95 : 0.8;
  return model === "Martingale" || model === "Adaptateur Biothane" ? 1.15 : 1;
};

const getEstMin = (base: number, cm: number, type: AccessoryKey, model: string) =>
  Math.max(15, Math.round(base * Math.min(2.6, Math.max(0.75, cm / getRefLen(type, model))) * getTimeMult(type, model)));

const getPaletteLayout = (n: number) =>
  n <= 2 ? { swatchSize: 6.2, gap: 8 } : n === 3 ? { swatchSize: 5.8, gap: 6.5 } : { swatchSize: 5.2, gap: 5.5 };

const safeRead  = <T,>(key: string, fb: T): T => { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const safeWrite = (key: string, val: any) => {
  try {
    const v = (key === STORAGE_KEYS.PROJECTS || key === STORAGE_KEYS.HISTORY) && Array.isArray(val)
      ? val.map((p: any) => ({ ...p, date: p.date || new Date().toLocaleDateString("fr-FR") })) : val;
    localStorage.setItem(key, JSON.stringify(v));
  } catch (e) { console.error(e); }
};

type FormData = {
  name: string; type: AccessoryKey; model: string; difficulty: string; nodeId: string;
  length: number; unit: LengthUnit; colorCount: number; roundingValue: number;
  secureMode: boolean; colors: string[]; ropeSize: RopeSize; harnessSize: HarnessSize;
};

type StoredProject = {
  id: string; date: string; name: string; type: AccessoryKey; model: string;
  difficulty: string; nodeId: string; knotName: string; estimatedTime: string;
  estimatedMinutes?: number; length: number; colorCount: number; roundingValue: number;
  secureMode: boolean; colors: string[];
  results: { perColor: number; ame: number; totalBrins: number; totalGeneral: number; knotName: string; factor: number; is3D: boolean; estimatedTime: string; estimatedMinutes?: number };
  timeSpent: number; createdAt: string; updatedAt: string;
};

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: "6px", cursor: "help" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible((v) => !v)}
    >
      <span style={{
        width: 16, height: 16, borderRadius: "50%", background: "#E8E4DC",
        color: "#888", fontSize: "10px", fontWeight: 900,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "1px solid #D0CBC0", flexShrink: 0,
      }}>?</span>
      {visible && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)",
          background: "#2A2A2A", color: "#fff",
          fontSize: "11px", lineHeight: 1.5,
          padding: "8px 12px", borderRadius: "10px",
          width: "220px", textAlign: "left",
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          zIndex: 999, pointerEvents: "none",
          whiteSpace: "normal", fontWeight: 400,
        }}>
          {text}
          <span style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderTop: "6px solid #2A2A2A",
          }} />
        </span>
      )}
    </span>
  );
}

const AccessoryButton = memo(({ id, acc, selected, locked, onClick }: {
  id: string; acc: typeof ACCESSORIES_CONFIG[AccessoryKey]; selected: boolean; locked: boolean; onClick: () => void;
}) => (
  <div onClick={onClick} style={{ ...accBtn, background: selected ? "#006D6F" : "#fff", color: selected ? "#fff" : "#333", position: "relative", opacity: locked ? 0.72 : 1 }}>
    <div style={{ fontSize: "20px" }}>{acc.icon}</div>
    <div style={{ fontSize: "10px", fontWeight: "bold" }}>{acc.label}</div>
    {locked && <span style={lockBadge}>🔒 {acc.lock}</span>}
  </div>
));

const DifficultyButton = memo(({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <div onClick={onClick} title={DIFFICULTY_TOOLTIPS[label]} style={{ ...lvlBtn, border: selected ? "1px solid #006D6F" : "1px solid #E0E0E0" }}>
    {label}
  </div>
));

const ColorRow = memo(({ color, index, onChange }: { color: string; index: number; onChange: (i: number, v: string) => void }) => (
  <div style={{ position: "relative" }}>
    <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", border: "1px solid #ccc" }} />
    <select value={color} onChange={(e) => onChange(index, e.target.value)} style={{ ...inputStyle, paddingLeft: "30px" }}>
      {COLORS_DATABASE.map((db) => <option key={db.hex} value={db.hex}>{db.name}</option>)}
    </select>
  </div>
));

const INITIAL_FORM: FormData = {
  name: "Nouveau Projet", type: "COLLIER", model: "Boucle plastique",
  difficulty: "Débutant", nodeId: "Cobra", length: 35, unit: "cm",
  colorCount: 2, roundingValue: 10, secureMode: true,
  colors: [COLORS_DATABASE[6].hex, COLORS_DATABASE[1].hex, "#1F1F1F", "#FFFFFF"],
  ropeSize: "4mm", harnessSize: "M",
};

export default function NewCalc() {
  const [step, setStep]               = useState(1);
  const [time, setTime]               = useState(0);
  const [isPaused, setIsPaused]       = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [formData, setFormData]       = useState<FormData>(INITIAL_FORM);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knotRef  = useRef<KnotPreviewHandle | null>(null);

  useEffect(() => { setTime(0); setIsPaused(true); }, [formData.nodeId]);
  useEffect(() => {
    if (!saveMessage) return;
    const t = setTimeout(() => setSaveMessage(""), 2500);
    return () => clearTimeout(t);
  }, [saveMessage]);
  useEffect(() => {
    if (!isPaused) { timerRef.current = setInterval(() => setTime((t) => t + 1), 1000); }
    else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused]);

  const effectiveLength = useMemo(() => {
    if (formData.type === "HARNAIS") {
      return HARNESS_SIZES.find(s => s.value === formData.harnessSize)?.lengthCm ?? 58;
    }
    return toCm(formData.length, formData.unit);
  }, [formData.type, formData.harnessSize, formData.length, formData.unit]);

  const knot = useMemo(() => KNOTS_REGISTRY.find((k) => k.id === formData.nodeId) ?? KNOTS_REGISTRY[0], [formData.nodeId]);

  const results = useMemo(() => {
    const margin     = formData.secureMode ? 1.1 : 1.0;
    const ropeFactor = formData.ropeSize === "3mm" ? 0.85 : 1.0;
    const lengthCm   = effectiveLength;
    const roundingCm = Math.max(1, toCm(formData.roundingValue, formData.unit));
    const perColor   = Math.ceil((lengthCm * knot.factor * ropeFactor * margin) / formData.colorCount / roundingCm) * roundingCm;
    const estMin     = getEstMin(knot.baseMinutes, lengthCm, formData.type, formData.model);
    const isHarnessEstimated = formData.type === "HARNAIS" || formData.type === "JOUETS";
    return {
      perColor, ame: lengthCm, estimatedMinutes: estMin, estimatedTime: fmtDur(estMin),
      totalBrins: perColor * formData.colorCount,
      totalGeneral: perColor * formData.colorCount + lengthCm,
      knotName: knot.name, factor: knot.factor, is3D: knot.is3D, calibrated: knot.calibrated && !isHarnessEstimated,
      isHarnessEstimated,
    };
  }, [formData, knot, effectiveLength]);

  const currentPalette = useMemo(() => formData.colors.slice(0, formData.colorCount), [formData.colors, formData.colorCount]);

  const handleReset = useCallback(() => { setFormData(INITIAL_FORM); setTime(0); setIsPaused(true); setSaveMessage(""); }, []);
  const handleColorChange = useCallback((i: number, value: string) => {
    setFormData((prev) => { const colors = [...prev.colors]; colors[i] = value; return { ...prev, colors }; });
  }, []);
  const handleDifficultyChange = useCallback((diff: string) => {
    const first = KNOTS_REGISTRY.find((k) => k.difficulty === diff);
    setFormData((prev) => ({ ...prev, difficulty: diff, nodeId: first ? first.id : prev.nodeId }));
  }, []);
  const handleTypeChange = useCallback((key: AccessoryKey) => {
    if (isAccLocked(ACCESSORIES_CONFIG[key].lock)) return;
    setFormData((prev) => ({ ...prev, type: key, model: ACCESSORIES_CONFIG[key].models[0] }));
  }, []);
  const handleUnitChange = useCallback((nextUnit: LengthUnit) => {
    setFormData((prev) => {
      const lCm = toCm(prev.length, prev.unit);
      const rCm = toCm(prev.roundingValue, prev.unit);
      return { ...prev, unit: nextUnit, length: roundDisp(fromCm(lCm, nextUnit), nextUnit), roundingValue: roundDisp(fromCm(rCm, nextUnit), nextUnit) };
    });
  }, []);

  const saveProject = useCallback((): StoredProject => {
    const now = new Date().toISOString();
    const [h, m] = results.estimatedTime.split("h").map(Number);
    const project: StoredProject = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toLocaleDateString("fr-FR"),
      name: formData.name.trim() || "Nouveau Projet",
      type: formData.type, model: formData.model,
      difficulty: formData.difficulty, nodeId: formData.nodeId,
      knotName: results.knotName, estimatedTime: results.estimatedTime,
      length: effectiveLength, colorCount: formData.colorCount,
      roundingValue: toCm(formData.roundingValue, formData.unit),
      secureMode: formData.secureMode, colors: currentPalette,
      results: { ...results },
      timeSpent: time || h * 3600 + m * 60,
      createdAt: now, updatedAt: now,
    };
    const prev = safeRead<StoredProject[]>(STORAGE_KEYS.PROJECTS, []);
    const filtered = prev.filter((p) => p.id !== project.id);
    safeWrite(STORAGE_KEYS.PROJECTS,     [project, ...filtered]);
    safeWrite(STORAGE_KEYS.DASHBOARD,    [project, ...filtered].slice(0, 2));
    safeWrite(STORAGE_KEYS.HISTORY,      [project, ...safeRead<StoredProject[]>(STORAGE_KEYS.HISTORY, []).filter((p) => p.id !== project.id)].slice(0, 100));
    safeWrite(STORAGE_KEYS.LAST_PROJECT, project);
    window.dispatchEvent(new Event("cordeslab:projects-updated"));
    return project;
  }, [formData, results, currentPalette, time, effectiveLength]);

  const handleCalculateAndSave = useCallback(() => {
    saveProject();
    setSaveMessage('Projet enregistré dans "Projet", "Dashboard" et "Historique".');
    setStep(2);
  }, [saveProject]);

  const generatePDF = useCallback(async () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pdfDate = new Date().toLocaleDateString("fr-FR");
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const mX = 14, cW = pageW - mX * 2;
    const C = {
      pageBg: [247,247,245] as [number,number,number], ink: [36,36,36] as [number,number,number],
      muted: [110,110,110] as [number,number,number], border: [52,52,52] as [number,number,number],
      softBorder: [214,214,214] as [number,number,number], beige: [239,236,228] as [number,number,number],
      green: [149,178,152] as [number,number,number], orange: [215,145,40] as [number,number,number],
      darkBox: [42,42,50] as [number,number,number], white: [255,255,255] as [number,number,number],
    };
    const colorNames = currentPalette.map((hex) => COLORS_DATABASE.find((c) => c.hex.toLowerCase() === hex.toLowerCase())?.name ?? hex);
    const bg = () => { doc.setFillColor(...C.pageBg); doc.rect(0, 0, pageW, pageH, "F"); };
    const footer = (n: number) => {
      doc.setDrawColor(...C.border); doc.setLineWidth(0.6); doc.line(mX, pageH-14, pageW-mX, pageH-14);
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(...C.muted);
      doc.text(`Page ${n} / 2`, pageW-mX, pageH-9.2, { align: "right" });
    };
    const header = () => {
      doc.setTextColor(...C.ink); doc.setFont("helvetica","bold"); doc.setFontSize(22); doc.text("CordesLab", mX, 16);
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(...C.muted);
      doc.text(`Date : ${pdfDate}`, pageW-mX, 16, { align: "right" });
      doc.text(`Produit : ${ACCESSORIES_CONFIG[formData.type].label}${formData.type === "HARNAIS" ? ` · Taille ${formData.harnessSize}` : ""}`, mX, 22);
      doc.setFont("helvetica","bold"); doc.setFontSize(12.5); doc.setTextColor(...C.ink);
      doc.text(`Projet ${formData.name}`, mX, 27);
      doc.setDrawColor(...C.border); doc.setLineWidth(0.7); doc.line(mX, 33.5, pageW-mX, 33.5);
    };
    const section = (y: number, title: string, accent: [number,number,number]) => {
      doc.setFillColor(...C.beige); doc.setDrawColor(...C.border); doc.setLineWidth(0.5);
      doc.roundedRect(mX, y, cW, 8.5, 3, 3, "FD");
      doc.setFillColor(...accent); doc.roundedRect(mX+1.4, y+1.2, 2.2, 6.1, 1.1, 1.1, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(11.5); doc.setTextColor(...C.ink);
      doc.text(title, mX+5, y+5.8);
    };
    const accentCard = (x: number, y: number, w: number, h: number, accent: [number,number,number]) => {
      doc.setFillColor(...C.beige); doc.setDrawColor(...C.border); doc.setLineWidth(0.65);
      doc.roundedRect(x, y, w, h, 7, 7, "FD");
      doc.setFillColor(...accent); doc.roundedRect(x+3.5, y+3.2, 2.2, h-6.4, 1.1, 1.1, "F");
    };
    try {
      let imgData = "";
      if (knotRef.current?.getSnapshot) { imgData = knotRef.current.getSnapshot(); }
      else {
        const el = document.getElementById("pdf-knot-preview");
        if (el) { const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null, logging: false }); imgData = canvas.toDataURL("image/png"); }
      }
      bg(); header();
      section(38, "Visuel du nœud", C.green);
      doc.setFillColor(...C.pageBg); doc.setDrawColor(...C.softBorder); doc.setLineWidth(0.5);
      doc.roundedRect(mX, 50, cW, 42, 5, 5, "FD");
      if (imgData) { doc.addImage(imgData, "PNG", (pageW-84)/2, 57, 84, 28, undefined, "FAST"); }
      else {
        doc.setFillColor(230,227,220); doc.roundedRect(mX+4, 52, cW-8, 36, 4, 4, "F");
        const sw=7, sg=10, tww=formData.colorCount*sw+(formData.colorCount-1)*sg, sx=(pageW-tww)/2;
        currentPalette.forEach((hex,i) => { doc.setFillColor(hex); doc.setDrawColor(100,100,100); doc.setLineWidth(0.3); doc.roundedRect(sx+i*(sw+sg),60,sw,sw,1.5,1.5,"FD"); });
        doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(60,60,60); doc.text(results.knotName, pageW/2, 76, { align: "center" });
        doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(140,140,140); doc.text("Aperçu disponible dans l'application", pageW/2, 82, { align: "center" });
      }
      doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(...C.muted);
      doc.text(`Durée de fabrication : ${fmtTime(time)}`, pageW-mX, 89, { align: "right" });
      section(98, "Longueurs à couper", C.green);
      autoTable(doc, {
        startY: 111, margin: { left: mX, right: mX }, tableWidth: cW,
        head: [["Rep.", `Longueur (${formData.unit})`, `Équiv. (${equivUnit(formData.unit)})`, "Note"]],
        body: Array.from({ length: formData.colorCount }, (_,i) => [`Corde ${i+1}`, fmtLen(results.perColor, formData.unit), fmtLen(results.perColor, equivUnit(formData.unit)), ""]),
        theme: "plain",
        styles: { font:"helvetica", fontSize:10, textColor:C.ink, lineColor:[80,80,80], lineWidth:0.25, cellPadding:{top:6,right:4,bottom:6,left:4}, valign:"middle", halign:"center" },
        headStyles: { fillColor:C.green, textColor:C.ink, fontStyle:"bold", minCellHeight:12 },
        bodyStyles: { fillColor:C.beige, minCellHeight:12 },
        columnStyles: { 0:{cellWidth:36,fontStyle:"bold"}, 1:{cellWidth:45}, 2:{cellWidth:39}, 3:{cellWidth:62} },
        didParseCell: (d) => { d.cell.styles.lineWidth=0.25; d.cell.styles.lineColor=[80,80,80]; },
        didDrawCell:  (d) => { doc.setDrawColor(80,80,80); doc.setLineWidth(0.25); doc.rect(d.cell.x, d.cell.y, d.cell.width, d.cell.height); },
      });
      const tableEndY = (doc as any).lastAutoTable.finalY ?? 150;
      const ameSY = tableEndY + 14;
      let ameY: number;
      if (ameY = ameSY+15, ameY+56 > pageH-18) { doc.addPage(); bg(); header(); section(38,"Âme",C.green); ameY=53; }
      else { section(ameSY,"Âme",C.green); }
      doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(...C.ink);
      doc.text("Âme(s) : x1", mX, ameY);
      doc.text(`Longueur : ${fmtLen(results.ame, formData.unit)} chacune`, mX, ameY+6.2);
      doc.text(`Total âme : ${fmtLen(results.ame, formData.unit)}`, mX, ameY+12.4);
      doc.setDrawColor(...C.border); doc.setLineWidth(0.45); doc.line(mX, ameY+20.5, pageW-mX, ameY+20.5);
      doc.setFillColor(...C.beige); doc.setDrawColor(...C.orange); doc.setLineWidth(0.75);
      doc.roundedRect(mX, ameY+27, cW, 22, 7, 7, "FD");
      doc.setFillColor(...C.orange); doc.roundedRect(mX+3.8, ameY+30.2, 3, 15.5, 1.5, 1.5, "F");
      doc.setTextColor(...C.ink); doc.setFont("helvetica","bold"); doc.setFontSize(11.5); doc.text("Vérification terminée", mX+10.5, ameY+38.8);
      doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...C.muted); doc.text('Consultez la section "Points de vigilance".', mX+10.5, ameY+45.8);
      footer(doc.getNumberOfPages());
      doc.addPage(); bg(); header();
      section(38,"Résumé",C.green);
      const sumY=50, sumH=Math.max(47, 34+formData.colorCount*6);
      accentCard(mX, sumY, cW, sumH, C.green);
      const lX=mX+10; let sY=62;
      doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(...C.ink);
      doc.text(`Produit : ${ACCESSORIES_CONFIG[formData.type].label}${formData.type === "HARNAIS" ? ` · Taille ${formData.harnessSize}` : ""}`, lX, sY);
      doc.text(`${formData.colorCount} couleurs`, mX+128, sY);
      doc.setFillColor(...C.green); doc.roundedRect(pageW-mX-28, 58.2, 22, 6.8, 2.4, 2.4, "F");
      doc.setFont("helvetica","bold"); doc.setFontSize(9.5); doc.setTextColor(...C.white); doc.text("estimé", pageW-mX-17, 62.8, { align:"center" });
      sY+=9.5;
      doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(...C.ink);
      doc.text(`Nœud : ${results.knotName} · ${formData.type === "HARNAIS" ? `Taille ${formData.harnessSize}` : `Longueur : ${formData.length} ${formData.unit}`} · Ø ${formData.ropeSize}`, lX, sY);
      doc.text(`Arrondi : ${formData.roundingValue} ${formData.unit} · Unité : ${formData.unit}`, mX+128, sY);
      sY+=11;
      colorNames.forEach((n,i) => doc.text(n, lX, sY+i*6));
      const pl=getPaletteLayout(formData.colorCount);
      const ptw=currentPalette.length*pl.swatchSize+(currentPalette.length-1)*pl.gap;
      const ctrX=mX+cW/2, pLY=sumY+sumH-18;
      doc.setFont("helvetica","bold"); doc.text("Palette :", ctrX, pLY, { align:"center" });
      currentPalette.forEach((hex,i) => { doc.setFillColor(hex); doc.setDrawColor(70,70,70); doc.setLineWidth(0.3); doc.roundedRect(ctrX-ptw/2+i*(pl.swatchSize+pl.gap), pLY+4.3, pl.swatchSize, pl.swatchSize, 1.1, 1.1, "FD"); });
      const synthSY=sumY+sumH+9;
      section(synthSY,"Synthèse",C.green);
      accentCard(mX, synthSY+13, cW, 57, C.green);
      const scY=synthSY+13;
      doc.setTextColor(...C.ink); doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.text("Total brins", lX, scY+14.5);
      doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.text(fmtLen(results.totalBrins, formData.unit), pageW-mX-8, scY+14.5, { align:"right" });
      doc.setDrawColor(120,120,120); doc.setLineWidth(0.3); doc.line(lX, scY+24.5, pageW-mX-8, scY+24.5);
      doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.text("Total général", lX, scY+29.5);
      doc.setFont("helvetica","bold"); doc.setFontSize(17); doc.text(fmtLen(results.totalGeneral, formData.unit), pageW-mX-8, scY+29.5, { align:"right" });
      doc.setFont("helvetica","normal"); doc.setFontSize(10.5); doc.setTextColor(...C.muted);
      doc.text(`Ces totaux incluent automatiquement la marge de 10% et l'arrondi (${formData.roundingValue} ${formData.unit}).`, lX, scY+49, { maxWidth:155 });
      doc.text(`Facteur : ${results.factor} · Marge : 10% · Arrondi : ${formData.roundingValue} ${formData.unit} · Corde : ${formData.ropeSize}`, lX, scY+54.8);
      doc.setDrawColor(...C.border); doc.setLineWidth(0.45); doc.line(mX, scY+62.5, pageW-mX, scY+62.5);
      const vigY=scY+69;
      section(vigY,"Points de vigilance",C.orange);
      doc.setFillColor(...C.darkBox); doc.setDrawColor(...C.darkBox); doc.roundedRect(mX, vigY+13, cW, 29, 6, 6, "FD");
      doc.setTextColor(...C.white); doc.setFont("helvetica","normal"); doc.setFontSize(11);
      doc.text("• Vérifiez vos mesures avant la coupe.", mX+8, vigY+26);
      doc.text("• La tension du tressage peut varier le résultat.", mX+8, vigY+34);
      footer(2);
      doc.save(`cordeslab-${formData.name}.pdf`);
    } catch (e) { console.error("PDF error:", e); }
  }, [formData, results, currentPalette, time, effectiveLength]);

  const KnotComponent = knot.component as any;
  const isHarness = formData.type === "HARNAIS";
  const currentHarnessSize = HARNESS_SIZES.find(s => s.value === formData.harnessSize)!;

  return (
    <div style={{ background: "#EAE3D2", minHeight: "100vh" }} className="newcalc-padding">
      {step === 1 && (
        <div className="newcalc-grid">

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={cardStyle}>
              <h3 style={h3Style}>GÉNÉRAL</h3>
              <input type="text" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} style={inputStyle} />
              <div className="acc-buttons-wrap" style={{ marginTop: "15px" }}>
                {(Object.entries(ACCESSORIES_CONFIG) as [AccessoryKey, typeof ACCESSORIES_CONFIG[AccessoryKey]][]).map(([key, acc]) => (
                  <AccessoryButton key={key} id={key} acc={acc} selected={formData.type === key} locked={isAccLocked(acc.lock)} onClick={() => handleTypeChange(key)} />
                ))}
              </div>
              <select style={{ ...inputStyle, marginTop: "15px" }} value={formData.model} onChange={(e) => setFormData((p) => ({ ...p, model: e.target.value }))}>
                {ACCESSORIES_CONFIG[formData.type].models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={cardStyle}>
              <h3 style={{ ...h3Style, display: "flex", alignItems: "center" }}>
                NIVEAU ET NŒUD
                <Tooltip text="Le niveau indique la complexité du nœud. Passez votre souris sur chaque bouton pour en savoir plus." />
              </h3>
              <div className="difficulty-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {DIFFICULTIES.map((d) => <DifficultyButton key={d} label={d} selected={formData.difficulty === d} onClick={() => handleDifficultyChange(d)} />)}
              </div>
              <select style={{ ...inputStyle, marginTop: "15px" }} value={formData.nodeId} onChange={(e) => setFormData((p) => ({ ...p, nodeId: e.target.value }))}>
                {KNOTS_REGISTRY.filter((k) => k.difficulty === formData.difficulty).map((k) => (
                  <option key={k.id} value={k.id} disabled={isKnotLocked(k.order)}>
                    {isKnotLocked(k.order) ? `🔒 ${k.name}` : isHarness && HARNESS_RECOMMENDED_KNOTS.includes(k.id) ? `⭐ ${k.name}` : k.name}
                  </option>
                ))}
              </select>
              {isHarness && (
                <div style={{ fontSize: "11px", color: "#006D6F", marginTop: "8px" }}>
                  ⭐ = nœud recommandé pour les harnais
                </div>
              )}
            </div>

            {/* PALETTE */}
            <div style={cardStyle}>
              <h3 style={h3Style}>PALETTE</h3>
              <select style={inputStyle} value={formData.colorCount} onChange={(e) => setFormData((p) => ({ ...p, colorCount: Number(e.target.value) }))}>
                {[1,2,3,4].map((n) => <option key={n} value={n}>{n} couleur(s)</option>)}
              </select>
              {formData.colorCount > 2 && (
                <div style={{ fontSize: "11px", color: "#006D6F", background: "#EDF8F5", border: "1px solid #CDE9E1", borderRadius: "8px", padding: "6px 10px", marginTop: "8px" }}>
                  ℹ️ L'aperçu 3D affiche uniquement les 2 premières couleurs. Les couleurs supplémentaires seront bien utilisées dans votre tressage.
                </div>
              )}
              <div className="params-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
                {currentPalette.map((c, i) => <ColorRow key={i} color={c} index={i} onChange={handleColorChange} />)}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={cardStyle}>
              <h3 style={h3Style}>APERÇU</h3>
              <h4 style={{ color: "#006D6F", textAlign: "center", marginBottom: "5px", fontWeight: "bold" }}>{results.knotName.toUpperCase()}</h4>
              <div style={{ fontSize: "14px", color: "#8C8C8C", textAlign: "center", marginBottom: "8px" }}>Durée approximative : {results.estimatedTime}</div>
              {(results.isHarnessEstimated || !results.calibrated) && (
                <div style={{ fontSize: "11px", color: "#B8860B", background: "#FFF8E1", border: "1px solid #FFD700", borderRadius: "8px", padding: "5px 10px", textAlign: "center", marginBottom: "10px" }}>
                  ⚠️ Longueurs estimées — pas encore vérifiées sur échantillon réel
                </div>
              )}
              <div style={previewBox} className="knot-preview-wrap">
                <KnotComponent ref={knotRef} color1={formData.colors[0]} color2={formData.colors[1]} accessoryType={formData.type} orientation="horizontal" />
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "10px", fontWeight: "900", color: "#006D6F", marginBottom: "5px" }}>PARAMÈTRES</div>
              <h2 style={{ fontSize: "24px", fontWeight: "900", marginBottom: "20px" }}>Réglages finaux</h2>

              {isHarness ? (
                <div>
                  <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                    Taille du chien
                    <Tooltip text="Sélectionnez la taille correspondant au tour de poitrail de votre chien. Les longueurs sont estimées — calibration en cours." />
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "10px" }}>
                    {HARNESS_SIZES.map((s) => (
                      <div key={s.value} onClick={() => setFormData((p) => ({ ...p, harnessSize: s.value }))}
                        style={{ padding: "10px 4px", borderRadius: "10px", textAlign: "center", cursor: "pointer", fontWeight: "bold", fontSize: "14px",
                          background: formData.harnessSize === s.value ? "#006D6F" : "#fff",
                          color: formData.harnessSize === s.value ? "#fff" : "#333",
                          border: formData.harnessSize === s.value ? "none" : "1px solid #EAEAEA" }}>
                        {s.value}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888", background: "#F9F9F9", borderRadius: "10px", padding: "8px 12px" }}>
                    Tour de poitrail : <strong>{currentHarnessSize.poitrail}</strong>
                  </div>
                </div>
              ) : (
                <div className="params-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={labelStyle}>Longueur ({formData.unit})</label>
                    <input type="number" step={formData.unit==="m"?"0.01":formData.unit==="in"?"0.1":"1"} value={formData.length} onChange={(e) => setFormData((p) => ({ ...p, length: Number(e.target.value) }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                      Arrondi
                      <Tooltip text="Les longueurs calculées sont arrondies au multiple de 10 supérieur. Ex : 343 cm avec un arrondi à 10 cm devient 350 cm." />
                    </label>
                    <select style={inputStyle} value={formData.roundingValue} onChange={(e) => setFormData((p) => ({ ...p, roundingValue: Number(e.target.value) }))}>
                      {(formData.unit==="cm"?[5,10,25,50]:formData.unit==="m"?[0.05,0.1,0.25,0.5]:[2,4,10,20]).map((v) => <option key={v} value={v}>{v} {formData.unit}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {!isHarness && (
                <div style={{ marginTop: "15px" }}>
                  <label style={labelStyle}>Unité</label>
                  <select style={inputStyle} value={formData.unit} onChange={(e) => handleUnitChange(e.target.value as LengthUnit)}>
                    {UNIT_OPTIONS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              )}

              <div style={{ marginTop: "15px" }}>
                <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                  Épaisseur corde
                  <Tooltip text="La paracorde 3mm consomme environ 15% moins de corde que la 4mm pour le même nœud." />
                </label>
                <select style={inputStyle} value={formData.ropeSize} onChange={(e) => setFormData((p) => ({ ...p, ropeSize: e.target.value as RopeSize }))}>
                  <option value="4mm">4 mm (standard)</option>
                  <option value="3mm">3 mm (fine)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 900, color: "#1A1A1A", marginBottom: "6px", display: "flex", alignItems: "center" }}>
                  Mode sécurisé ({formData.secureMode ? "10%" : "0%"})
                  <Tooltip text="Ajoute 10% de corde en plus pour compenser les variations de tension selon votre façon de tresser. Recommandé pour les débutantes." />
                </div>
                <div style={{ fontSize: "12px", color: "#8C8C8C", marginBottom: "8px" }}>Marge de sécurité incluse.</div>
              </div>
              <input type="checkbox" checked={formData.secureMode} onChange={(e) => setFormData((p) => ({ ...p, secureMode: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "#35A5D3", marginTop: "2px" }} />
            </div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#1A1A1A", marginBottom: "8px" }}>{formData.secureMode ? "Sécurité maximale (10%)" : "Sécurité standard (0%)"}</div>
            <div style={{ height: "8px", background: "#E9E9E9", borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ width: formData.secureMode ? "78%" : "42%", height: "100%", background: "#0A7A78", borderRadius: "999px" }} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleCalculateAndSave} style={{ ...mainBtn, flex: 2 }}>Calculer et enregistrer</button>
              <button onClick={handleReset} style={{ ...secBtn, flex: 1 }}>Réinitialiser</button>
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "10px", display: "flex", alignItems: "flex-start", gap: "5px" }}>
              <span>💡</span>
              <span>Calcule les longueurs et enregistre automatiquement dans Dashboard, Projets et Historique.</span>
            </div>
            {saveMessage && <div style={saveInfoStyle}>{saveMessage}</div>}
          </div>

        </div>
      )}

      {step === 2 && (
        <div style={{ background: "#EAE3D2", minHeight: "100vh" }}>
          <div style={{ maxWidth: "850px", margin: "0 auto", background: "#fff", borderRadius: "30px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontWeight: 900 }}>Fiche projet</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => window.print()} style={secBtn}>🖨️ Imprimer</button>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
                  <button onClick={generatePDF} style={mainBtn}>📥 Télécharger PDF</button>
                  <span style={{ fontSize: "11px", color: "#888" }}>Plan de coupe complet (2 pages)</span>
                </div>
              </div>
            </div>

            <div id="pdf-knot-preview" style={{ background: "#F9F9F9", borderRadius: "24px", overflow: "hidden", height: "160px", margin: "20px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ transform: "scale(0.85)", transformOrigin: "center center", flexShrink: 0 }}>
                <KnotComponent ref={knotRef} color1={formData.colors[0]} color2={formData.colors[1]} accessoryType={formData.type} orientation="horizontal" />
              </div>
            </div>

            <div style={{ padding: "0 20px", marginBottom: "30px" }}>
              {currentPalette.map((_, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F0F0" }}>
                  <span>Corde {i+1}</span>
                  <span style={{ fontWeight: "bold" }}>{fmtLen(results.perColor, formData.unit)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
                <span>Âme structurelle</span>
                <span style={{ fontWeight: "bold" }}>{fmtLen(results.ame, formData.unit)}</span>
              </div>
            </div>

            <div className="params-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div style={{ background: "#006D6F", color: "#fff", padding: "20px", borderRadius: "20px" }}>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>TOTAL GÉNÉRAL</div>
                <div style={{ fontSize: "28px", fontWeight: "900" }}>{fmtLen(results.totalGeneral, formData.unit)}</div>
              </div>
              <div style={{ background: "#1A1A1A", color: "#fff", padding: "20px", borderRadius: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>CHRONO RÉEL</span>
                  <span
                    style={{ fontSize: "9px", background: "rgba(255,255,255,0.15)", color: "#bbb", padding: "2px 6px", borderRadius: "6px", cursor: "help" }}
                    title="Chronométrez votre tressage pour connaître votre temps réel par projet. Indispensable pour fixer un prix de vente juste : temps × tarif horaire = coût de fabrication."
                  >
                    ? À quoi ça sert
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "900" }}>{fmtTime(time)}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
              <button onClick={() => setIsPaused((p) => !p)} style={{ ...mainBtn, width: "100%", padding: "15px" }}>
                {isPaused ? "▶ Démarrer le chrono" : "⏸ Pause"}
              </button>
              <button onClick={() => setStep(1)} style={{ ...secBtn, width: "100%", marginTop: 0 }}>Retour</button>
            </div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "10px", textAlign: "center" }}>
              Lancez le chrono dès que vous commencez à tresser, mettez en pause si vous vous arrêtez. À la fin, vous saurez exactement combien de temps ce projet vous a pris — et combien le facturer.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle     = { background: "#fff", padding: "20px", borderRadius: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" };
const h3Style       = { fontSize: "10px", fontWeight: "900" as const, color: "#B0B0B0", marginBottom: "15px" };
const inputStyle    = { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #EAEAEA", fontSize: "13px" };
const accBtn        = { padding: "10px", borderRadius: "15px", textAlign: "center" as const, cursor: "pointer", minHeight: "62px", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", width: "100%" };
const lvlBtn        = { padding: "10px", borderRadius: "10px", textAlign: "center" as const, fontSize: "12px", fontWeight: "bold" as const, cursor: "pointer" };
const previewBox    = { height: "160px", background: "#F3F1EA", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" as const, overflow: "hidden" as const };
const mainBtn       = { padding: "10px 15px", borderRadius: "15px", border: "none", background: "#006D6F", color: "#fff", fontWeight: "bold", cursor: "pointer" };
const secBtn        = { padding: "10px 15px", borderRadius: "15px", border: "1px solid #EEE", background: "#FFF", cursor: "pointer" };
const labelStyle    = { fontSize: "11px", fontWeight: "bold" as const, color: "#666", marginBottom: "5px", display: "block" };
const lockBadge     = { position: "absolute" as const, top: "-6px", left: "50%", transform: "translateX(-50%)", fontSize: "8px", fontWeight: 700, background: "#4A4A4A", color: "#fff", padding: "2px 5px", borderRadius: "6px", lineHeight: 1.1 };
const saveInfoStyle = { marginTop: "14px", padding: "10px 12px", borderRadius: "12px", background: "#EDF8F5", border: "1px solid #CDE9E1", color: "#0C5E57", fontSize: "12px", fontWeight: 700 };
