# 📊 La Bagunça Analytics Dashboard

![La Bagunça Logo](/public/preview_la_bagunca.png)

## 🚀 Présentation

Dashboard analytique moderne pour La Bagunça, permettant de visualiser et d'analyser les données commerciales de manière interactive et élégante. Développé par l'équipe Gran🍪Lab lors du hackathon AVISIA.

**[Accéder au dashboard en ligne](https://precious-blini-54736a.netlify.app/)**

Autrement, pour un démarrage en local :

1. Installez les dépendances : `npm install`
2. Lancez le server : `npm run dev`
3. Ouvrez : http://localhost:8080/

## ✨ Fonctionnalités

- **Vue globale du business** : Chiffre d'affaires, commandes, performances par catégorie et région
- **Satisfaction client** : Analyse des notes clients et des délais de livraison
- **Rentabilité produit** : Analyse détaillée des performances produits et des ratios de profit
- **Chatbot IA** : Assistant intelligent pour analyser les données en langage naturel
- **Interface responsive** : Expérience utilisateur optimisée sur tous les appareils
- **Mode sombre/clair** : Interface adaptable aux préférences visuelles
- **Filtres interactifs** : Analyse personnalisée par année, région, catégorie et produit

## 🤖 Chatbot IA

Le dashboard intègre un assistant IA basé sur Gemini 1.5 Flash de Google pour l'analyse des données en langage naturel:

- Analyse conversationnelle des KPIs, régions et catégories
- Réponses précises et concises aux questions métier
- Interface intuitive avec suggestions de questions

### Configuration du Chatbot

1. Créez un fichier `.env` à la racine du projet (basé sur `.env.example`)
2. Obtenez une clé API pour [Gemini AI](https://makersuite.google.com/app/apikey)
3. Ajoutez votre clé à la variable `VITE_GEMINI_API_KEY` dans le fichier `.env`

## 🛠️ Technologies

- React + TypeScript
- Vite
- Recharts pour les visualisations
- Tailwind CSS
- Shadcn/UI pour les composants
- Google Gemini 1.5 Flash pour l'IA conversationnelle

## 👥 Équipe Gran🍪Lab

Dashboard conçu et développé avec passion pour La Bagunça, en respectant l'identité visuelle de la marque avec ses couleurs emblématiques : bleu marine, vert et jaune.

---

© 2023 La Bagunça Analytics | Développé par Gran🍪Lab
