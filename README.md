# 🥪 Lunchbox – Backend GraphQL

Backend pour l'application **Lunchbox**, un service de commande de déjeuner. Ce backend utilise **Apollo Server** en **TypeScript**, et interroge directement une base **PostgreSQL** avec le module `pg`, sans ORM.

---

## ❓ ORM ou pas ?

| Type de projet      | Recommandation ORM                 |
| ------------------- | ---------------------------------- |
| Prototype ou petit  | ❌ Pas nécessaire, SQL brut suffit |
| Moyen à grand       | ✅ Utiliser Prisma ou TypeORM      |
| Long terme / équipe | ✅ Recommandé pour maintenabilité  |

---

## 📁 Structure des fichiers

```

src/
├── graphql/
│   ├── schema.graphql       # Définition du schéma GraphQL
│   └── resolvers.ts         # Fonctions pour chaque type/résolveur
├── db.ts                    # Connexion PostgreSQL avec `pg`
└── index.ts                 # Lancement du serveur Apollo

```

---

## ⚙️ 1. Installation des dépendances

```bash
npm init -y

npm install apollo-server graphql pg dotenv
npm install --save-dev typescript ts-node ts-node-dev @types/node
```

---

## ⚙️ 2. Fichier `.env` à la racine

```env
DATABASE_URL=postgresql://postgres:TON_MDP@localhost:5432/box_lunchDB
```

---

## ⚙️ 3. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

---

## ⚙️ 4. Script `package.json`

```json
"scripts": {
  "dev": "ts-node-dev --respawn src/index.ts"
}
```

---

## 🚀 5. Exemple minimal `src/index.ts`

```ts
import { ApolloServer } from "apollo-server";
import fs from "fs";
import path from "path";
import { resolvers } from "./graphql/resolvers";

const typeDefs = fs.readFileSync(
  path.join(__dirname, "graphql", "schema.graphql"),
  "utf-8"
);

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

---

## ▶️ Lancer le serveur

```bash
npm run dev
```

---

## 🧠 Diagramme de flux

```
1️⃣ React Frontend (Apollo Client)
        |
        |  mutation { createUser(...) }
        ↓
2️⃣ Apollo Server (Node.js)
        |
3️⃣ Vérifie le schéma (typeDefs)
        |
4️⃣ Appelle le résolveur `createUser`
        ↓
5️⃣ Résolveur exécute SQL avec `pg`
        ↓
6️⃣ PostgreSQL renvoie les données
        ↓
7️⃣ Résolveur retourne l'utilisateur créé
        ↓
8️⃣ Apollo Server répond au frontend
```

---

## 📝 Remarques

- 🔍 Les requêtes SQL sont écrites directement dans les résolveurs.
- ⚠️ Sécurité (ex: hash de mot de passe) non incluse par défaut → à ajouter.
- 🧪 Pense à tester avec un outil comme Postman, Insomnia ou Apollo Studio.
- 🛠 Pour un projet sérieux, ajoute Prisma + validation + authentification JWT.

---

## ✅ Exemple de mutation (GraphQL Playground)

```graphql
mutation {
  createUser(name: "Alice", email: "alice@mail.com", password: "test123") {
    user_id
    name
    email
  }
}
```

---

## 📦 Technologies

- [Node.js](https://nodejs.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [PostgreSQL](https://www.postgresql.org/)
- [pg](https://node-postgres.com/)
