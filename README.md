# GreenFair Dashboard

GreenFair Dashboard est une application statique React/Vite qui transforme un notebook Google Colab en tableau de bord de durabilité clair, professionnel et prêt pour GitHub Pages. L'application présente un score GreenFair construit à partir d'indicateurs World Bank, avec une interface en français et des scénarios 2024-2025/2030 explicitement balisés.

## Points clés

- Frontend-only, sans backend, sans base de données, sans authentification
- Données d'exécution 100 % statiques via `src/data/greenfairData.json`
- Génération build-time par scripts Python
- Responsive mobile, tablette et desktop
- Pages: vue globale, analyse par pays, comparaison, focus Tunisie, prévisions, clustering, méthodologie

## Sécurité

- Ne pas exposer de clés API dans le frontend.
- Le notebook source contenait une clé Gemini en dur. Elle a été retirée de cette copie du projet et doit être rotatée/supprimée côté propriétaire.
- L'application ne fait aucun appel Gemini/OpenAI côté navigateur.

## Méthodologie résumée

- Source principale: indicateurs World Bank pour 10 pays, 15 indicateurs, période observée 1998-2023
- Normalisation Min-Max par indicateur
- Inversion des indicateurs négatifs: CO2 par habitant, PM2.5, inflation, chômage
- Pondération GreenFair Score:
  - Environnement: 40 %
  - Social: 35 %
  - Économie: 25 %
- Niveaux unifiés:
  - `>= 70`: Leader durable
  - `>= 55`: Potentiel solide
  - `>= 40`: Transition fragile
  - sinon: Priorité critique

## Limites de données

- `2024-2025` sont des scénarios extrapolés, pas des observations officielles.
- `2030` est une projection modèle, pas une prévision factuelle.
- La disponibilité World Bank peut varier selon l'indicateur et le pays.
- Le clustering est aligné sur la structure attendue du notebook pour cohérence de démonstration.

## Travailler dans WSL

Chemin recommandé:

```bash
~/code/greenfair-dashboard
```

Éviter `/mnt/c/...` pour le développement quotidien WSL si possible.

## Installation / setup

```bash
bash scripts/setup_wsl_project.sh
```

ou

```bash
npm run setup
```

## Développement

Frontend seul:

```bash
npm run dev
```

Frontend + watcher de données:

```bash
npm run dev:full
```

## Rechargement automatique

- Vite HMR recharge les changements frontend.
- `watch:data` régénère le JSON lorsque le notebook ou les scripts Python changent.
- `dev:full` lance les deux en parallèle.

## Régénérer les données

```bash
npm run data:build
npm run data:validate
```

Le script `scripts/build_greenfair_data.py` peut récupérer les données World Bank au build-time et écrit un cache local pour permettre une reconstruction hors-ligne si nécessaire.

## Vérification et build

Vérification complète:

```bash
npm run verify
```

Build production:

```bash
npm run build
```

## Prévisualisation locale

```bash
npm run preview
```

## Déploiement GitHub Pages

```bash
npm run deploy:gh-pages
```

Le déploiement publie `dist/` après validation complète.

## Pages de l'application

- Tableau de bord global
- Analyse par pays
- Comparaison multi-pays
- Focus Tunisie
- Prévisions 2026 et projection 2030
- Clustering stratégique
- Méthodologie

## Notebook source

Le notebook source est conservé dans [notebooks/greenfair_score_m1_project.ipynb](/mnt/c/Users/Youss/Desktop/greenfair/notebooks/greenfair_score_m1_project.ipynb). La copie stockée dans ce dépôt a été assainie pour retirer la clé exposée.
