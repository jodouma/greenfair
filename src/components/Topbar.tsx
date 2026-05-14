import { motion } from "framer-motion";
import { PageKey } from "../types/greenfair";
import { PAGE_META } from "../utils/constants";

const descriptions: Record<PageKey, string> = {
  overview: "Vue synthétique des classements, piliers et tendances.",
  country: "Lecture détaillée d'un pays, de ses piliers et de ses scénarios.",
  compare: "Comparaison multi-pays des scores, piliers et trajectoires.",
  tunisia: "Lecture ciblée de la Tunisie avec nuances régionales.",
  forecast: "Scénarios 2026, projection 2030 et comparaison des modèles.",
  clustering: "Groupes stratégiques issus de profils moyens de durabilité.",
  methodology: "Hypothèses, indicateurs, pondérations et limites du score."
};

interface TopbarProps {
  activePage: PageKey;
}

export function Topbar({ activePage }: TopbarProps) {
  const page = PAGE_META.find((entry) => entry.key === activePage)!;

  return (
    <motion.header
      key={activePage}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-[2rem] border border-white/10 bg-hero-grid p-6 shadow-soft"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">GreenFair Score</p>
      <h2 className="mt-3 text-3xl sm:text-4xl">{page.label}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200/85 sm:text-base">
        {descriptions[activePage]}
      </p>
    </motion.header>
  );
}
