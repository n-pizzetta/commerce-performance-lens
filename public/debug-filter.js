// Ce script peut être exécuté dans la console du navigateur pour comprendre le problème
console.log("Débogage des filtres");

// 1. Analyser les données chargées
const data = window.__DASHBOARD_DATA__;
console.log("Données du dashboard:", data);

// 2. Vérifier les catégories
console.log("Catégories disponibles:", data.categories.map(c => c.name));

// 3. Vérifier les régions
console.log("Régions disponibles:", data.regions.map(r => r.name));

// 4. Vérifier les filtres
const filterOptions = document.querySelectorAll('select');
console.log("Options de filtre:", [...filterOptions].map(f => ({
  name: f.getAttribute('aria-label'),
  options: [...f.options].map(o => ({ value: o.value, label: o.text })),
  selectedValue: f.value
})));

// 5. Tester manuellement un filtre
function testFiltre(filtre, valeur) {
  if (filtre === 'region') {
    // Test de filtre par région
    const regionsFiltrées = data.regions.filter(r => 
      valeur === 'all' ? true : r.name.toLowerCase() === valeur.toLowerCase()
    );
    console.log(`Régions filtrées (${valeur}):`, regionsFiltrées);
  } else if (filtre === 'categorie') {
    // Test de filtre par catégorie
    const categoriesFiltrées = data.categories.filter(c => 
      valeur === 'all' ? true : c.name.toLowerCase() === valeur.toLowerCase()
    );
    console.log(`Catégories filtrées (${valeur}):`, categoriesFiltrées);
  }
}

// Tester le filtrage avec les valeurs actuelles
testFiltre('region', data.meta.states[0].toLowerCase());
testFiltre('categorie', data.meta.categories[0].toLowerCase());
