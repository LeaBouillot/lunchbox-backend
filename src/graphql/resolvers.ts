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

      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
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
      const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
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
