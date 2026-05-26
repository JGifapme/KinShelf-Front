\# KinShelf — Front-end



Interface Vue.js 3 pour la gestion de bibliothèque personnelle KinShelf.



\## Prérequis



\- Node.js 18+

\- npm



\## Installation



\### 1. Cloner le repository



```bash

git clone <url-front>

cd kinshelf-front

```



\### 2. Installer les dépendances



```bash

npm install

```



\### 3. Configurer les variables d'environnement



Créer un fichier `.env` à la racine du projet :



```env

VITE\_API\_URL=http://localhost:8080

```



\### 4. Lancer l'application



```bash

npm run dev

```



L'application est accessible sur `http://localhost:5173`.



\## Build pour la production



```bash

npm run build

```



Les fichiers générés se trouvent dans le dossier `dist/`.



\## Structure du projet



```

src/

├── assets/          # Styles globaux et ressources statiques

├── composables/     # Logique réutilisable (bookLibrary, useUserProfile...)

├── config/    # Interceptors axios (gestion 401/403)

├── router/          # Configuration des routes Vue Router

├── stores/          # Stores Pinia (auth, filtres)

└── views/           # Pages de l'application

│   └── profile/     # Onglets de la page profil

```



\## Variables d'environnement disponibles



| Variable | Description | Défaut |

|---|---|---|

| `VITE\_API\_URL` | URL de l'API back-end | `http://localhost:8080` |



\## Notes



\- L'authentification est gérée via des \*\*cookies HttpOnly\*\* — aucun token n'est stocké dans le localStorage.

\- Le back-end doit être lancé avant le front-end.

\- Les cookies étant `SameSite=Strict`, le front et le back doivent tourner sur le même domaine en production.



