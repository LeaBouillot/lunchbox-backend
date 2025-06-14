## 🛡️ Plan d’ajout sécurité et auth dans Lunchbox

Ajouter **sécurité + authentification** pour permettre aux utilisateurs de :

- Créer un compte (`/join`) avec mot de passe sécurisé
- Se connecter (`/login`) et rester authentifiés avec **JWT**
- Naviguer entre les pages tant que le token est valide

### ✅ 1. 🔒 Hachage des mots de passe (bcrypt)

> Empêche de stocker les mots de passe en clair dans la base de données.

#### Installation :

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

#### Backend (dans `resolvers.ts`) :

```ts
import bcrypt from "bcrypt";

// Lors de l'inscription
createUser: async (_: any, { name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING user_id, name, email`,
    [name, email, hashedPassword]
  );

  return result.rows[0];
},
```

---

### ✅ 2. 🔐 Authentification et génération de JWT (json web token)

> Le client garde un token pour rester connecté.

#### Installation :

```bash
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

### ✅ 1. Générer un JWT_SECRET sécurisé aléatoire via un terminal

```bash
openssl rand -base64 64
```

#### `.env` :

```
JWT_SECRET=wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEYJdFl8zL8VXf==
```

#### Backend (dans `resolvers.ts`)

**Les résolveurs doivent être organisés par type du schéma**

```ts
export const resolvers = {
  Query: {
    users: async () => { ... },
    textes: async () => { ... },
    comments: async () => { ... },
  },
  Mutation: {
    login: async () => { ... },
    createUser: async () => { ... }
  }
}

```

**`resolvers.ts`**

```ts
import { pool } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export const resolvers = {
  Query: {
    // Pour test ou admin
    users: async () => {
      const res = await pool.query("SELECT user_id, name, email FROM users");
      return res.rows;
    },

    textes: async () => {
      const res = await pool.query("SELECT * FROM texte");
      return res.rows;
    },

    comments: async () => {
      const res = await pool.query("SELECT * FROM comment");
      return res.rows;
    },
  },

  Mutation: {
    // Inscription
    createUser: async (
      _: any,
      args: { user_id: string; name: string; email: string; password: string }
    ) => {
      const { user_id, name, email, password } = args;

      const existing = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (existing.rows.length > 0) {
        throw new Error("Email déjà utilisé");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `INSERT INTO users (user_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email`,
        [user_id, name, email, hashedPassword]
      );

      return result.rows[0];
    },

    // Connexion
    login: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      const user = res.rows[0];
      if (!user) throw new Error("Utilisateur non trouvé");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Mot de passe invalide");

      const token = jwt.sign(
        { user_id: user.user_id, name: user.name, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return { token };
    },
  },
};
```

#### 🔧 Schéma GraphQL `schema.graphql`

```graphql
type Query {
  users: [User!]!
  textes: [Texte!]!
  comments: [Comment!]!
}

type Mutation {
  login(email: String!, password: String!): AuthPayload
  createUser(
    user_id: String!
    name: String!
    email: String!
    password: String!
  ): User
}

type User {
  user_id: String!
  name: String!
  email: String!
}

type Texte {
  id: ID!
  content: String!
  # ajoute les champs nécessaires
}

type Comment {
  id: ID!
  texteId: ID!
  content: String!
  # ajoute les champs nécessaires
}

type AuthPayload {
  token: String!
}
```

---

### ✅ 3. 🧠 Auth côté frontend (React)

#### 📦 Ajouter `jwt-decode` pour lire les infos du token :

```bash
npm install jwt-decode
npm install --save-dev @types/jwt-decode
```

#### Exemple : `auth.ts` (frontend utils)

```ts
import jwt_decode from "jwt-decode";

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  try {
    return jwt_decode(token);
  } catch {
    return null;
  }
}
```

#### 🪪 Ajouter le token dans Apollo Client

```ts
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getToken } from "./auth"; // ton util

const httpLink = createHttpLink({
  uri: "http://localhost:4000/", // ton backend
});

const authLink = setContext((_, { headers }) => {
  const token = getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

---

### ✅ 4. 🔒 Protéger les routes serveur avec le token

```ts
import { AuthenticationError } from "apollo-server";
import jwt from "jsonwebtoken";

function getUserFromToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
}

const context = ({ req }: any) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  const user = getUserFromToken(token);
  return { user };
};

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers, context });
```

#### Dans un résolveur :

```ts
textes: async (_: any, __: any, context: any) => {
  if (!context.user) throw new AuthenticationError("Non authentifié !");
  // continuer...
};
```

---

## 🎉 Résultat final

| Action         | Sécurité                   |
| -------------- | -------------------------- |
| Join / Login   | Mot de passe haché, token  |
| Connexion      | JWT envoyé côté client     |
| Accès protégé  | Token vérifié côté serveur |
| Reste connecté | Token dans localStorage    |
| Déconnexion    | Suppression du token       |

## Tester sur http://localhost:4000/

**create user**

```
mutation {
  createUser(
    user_id: "u123",
    name: "Toto",
    email: "toto@toto.com",
    password: "123456"
  ) {
    user_id
    name
    email
  }
}
```

**login**

```
mutation {
  login(email: "toto@toto.com", password: "123456") {
    token
  }
}

```
