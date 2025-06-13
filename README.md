# 🥪 Lunchbox – Backend GraphQL

Backend pour l'application **Lunchbox**, un service de commande de déjeuner. Ce backend utilise **Apollo Server** en **TypeScript**, et interroge directement une base **PostgreSQL** avec le module `pg`, sans ORM.

---

## ❓ ORM ou pas ?

| Type de projet       | Recommandation ORM                    |
| -------------------- | ------------------------------------- |
| Prototype ou petit   | ❌ Pas nécessaire, SQL brut suffit    |
| Moyen à grand        | ✅ Utiliser Prisma ou TypeORM         |
| Long terme / équipe  | ✅ Recommandé pour maintenabilité     |

---

## 📁 Structure des fichiers

