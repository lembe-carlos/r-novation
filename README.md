# SuperMarché CM 🇨🇲

**La super-app e-commerce du Cameroun**

## Stack technique
- Frontend : HTML / CSS / JavaScript vanilla
- Backend : Node.js sur Railway
- Base de données : Supabase (PostgreSQL)
- SMS : Africa's Talking
- Déploiement : Vercel + GitHub Pages
- PWA : Service Worker + manifest.json

## Déploiement sur Vercel

### Étape 1 — Créer le dépôt GitHub
```bash
git init
git add .
git commit -m "SuperMarché CM v51"
git remote add origin https://github.com/TON_USER/supermarche-cm.git
git push -u origin main
```

### Étape 2 — Connecter Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer **Add New Project**
3. Importer le dépôt GitHub
4. Vercel détecte automatiquement le `vercel.json`
5. Cliquer **Deploy**

### Étape 3 — Variables d'environnement sur Vercel
Dans les settings du projet Vercel, ajouter :
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Étape 4 — Activer Africa's Talking en production
1. Créer un compte sur [africastalking.com](https://africastalking.com)
2. Créer une application "supermarche-cm"
3. Activer le pays Cameroun (+237)
4. Mettre à jour `AT_API_KEY` dans le backend Railway

## Structure des fichiers
```
supermarche-cm/
├── index.html          # Application principale (42 pages)
├── boutique.html       # Boutique client
├── script.js           # Logique principale
├── style.css           # Styles
├── config.js           # Configuration Supabase
├── coiffure.js         # Module Salon de Coiffure
├── pressing.js         # Module Pressing
├── automobile.js       # Module Automobile
├── menuiserie.js       # Module Menuiserie
├── restauration.js     # Module Restauration & Food
├── energie.js          # Module Énergie & Solaire
├── sante.js            # Module Santé & Médical
├── btp.js              # Module BTP & Construction
├── agriculture.js      # Module Agriculture & Élevage
├── logistique.js       # Module Logistique
├── education.js        # Module Éducation
├── immobilier.js       # Module Immobilier
├── multi-users.js      # Gestion des rôles
├── abonnements.js      # Abonnements gérants
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker PWA
└── vercel.json         # Configuration déploiement
```

## Modules disponibles (20 modules)
| Module | Fonctionnalités |
|--------|----------------|
| Coiffure | RDV, calendrier, abonnements, fiche client, CA mensuel |
| Pressing | Dépôts, suivi statuts, abonnements, livraison |
| Automobile | RDV mécanicien, devis réparation, stock pièces |
| Menuiserie | Configurateur, calculateur matériaux, galerie, devis |
| Meubles | Catalogue, panier, commandes, montage |
| Restauration | 4 restaurants, commandes, livraison SMS |
| Énergie | 22 produits, simulateur kit solaire, devis installation |
| Santé | 6 médecins, pharmacie, dossiers patients, urgences |
| BTP | 23 matériaux, 5 artisans, devis travaux |
| Agriculture | 22 produits, calendrier cultural, commandes |
| Logistique | Colis inter-villes, location véhicules |
| Éducation | Fournitures, cours particuliers, réservations |
| Immobilier | 11 annonces, location/vente/hôtels |

## Contacts
- Entrepreneur : Carlos NGAPET LEMBE
- Email : lembetiny02@gmail.com
- MTN MoMo : 683 39 22 68
- Orange Money : 693 59 14 79
