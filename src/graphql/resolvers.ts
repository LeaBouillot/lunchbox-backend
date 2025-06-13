import { pool } from "../db";

export const resolvers = {
  Query: {
    users: async (_: any, args: { email?: string; password?: string }) => {
      if (args.email && args.password) {
        const res = await pool.query(
          "SELECT user_id, name, email, password, about_me, joined, is_active FROM users WHERE email = $1 AND password = $2",
          [args.email, args.password]
        );
        return res.rows;
      }

      const res = await pool.query(
        "SELECT user_id, name, email, password, about_me, joined, is_active FROM users"
      );
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
    createUser: async (
      _: any,
      args: { user_id: string; name: string; email: string; password: string }
    ) => {
      const { user_id, name, email, password } = args;
      // insertion explicite du user_id fourni
      const result = await pool.query(
        `INSERT INTO users (user_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email`,
        [user_id, name, email, password]
      );
      return result.rows[0];
    },
  },
};
