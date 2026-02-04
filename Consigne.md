# Contexte de l'application

Application mobile de gestion d’inventaire alimentaire et ménager pour la maison, avec gestion des dates d’expiration, panier de courses et recettes intelligentes.

Le principe central : l’application ne gère pas des quantités théoriques, mais des unités physiques réelles (paquets, bouteilles, etc.).

Chaque ligne dans `product_batches` représente une unité réelle possédée dans la maison.

---

# Structure logique

## Hiérarchie

Catégorie → Sous-catégorie → Produit → Unités réelles (product_batches)

Exemple :
Féculents → Pâtes → Tagliatelles Barilla 500g → 3 paquets avec dates différentes

---

# Stock

Le stock n’est pas une quantité enregistrée.

Il est calculé dynamiquement :


Les dates d’expiration sont portées par les unités.

---

# Achats

Un produit apparaît dans "Achats" si :


---

# Panier

Il existe **un seul panier par maison**.

Quand on clique sur "Acheter", cela crée des lignes dans `product_batches` (une ligne par unité achetée).

---

# Recettes

Les recettes sont liées aux produits (types), pas aux unités.

Une recette est faisable si, pour tous ses ingrédients :


Si `multipliable = true`, alors :


---

# Quand on cuisine une recette

Les unités à consommer sont choisies selon la règle FEFO :

First Expired, First Out (on consomme d’abord ce qui expire le plus tôt).

On supprime les lignes correspondantes dans `product_batches`.

---

# Étapes de recette

Les étapes sont stockées dans `recipe_steps` avec un `step_number`.

Le bouton "+" ajoute une nouvelle étape avec le numéro suivant.

---

# Tags de recettes

Les tags (végétarien, rapide, dessert…) sont gérés via :

- recipe_tags
- recipes_recipe_tags

Permet de filtrer les recettes.

---

# Règles importantes

- Ne jamais stocker une "quantité" de produit ailleurs que via le nombre de `product_batches`.
- Les dates d’expiration sont uniquement dans `product_batches`.
- Le panier est unique par maison.
- Les recettes ne pointent jamais vers des unités, uniquement vers des produits.
