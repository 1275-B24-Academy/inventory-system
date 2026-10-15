const pool = require("../db");
class UserRepository {
    async findbyEmail(email) {
        const result = await pool.query(
           `SELECT id, name, email, password_hash, role, status, created_at FROM users WHERE email = $1`,
              [email]
        );
        return result.rows[0] ?? null;
    }
    async findById(id) {
        const result = await pool.query(
            `SELECT id, name, email, role, status
            FROM users
            WHERE id = $1`,
            [id]
        );

        return result.rows[0] ?? null;
}
    async create(user) {
        const {name, email, password_hash} =user;
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, 'staff', 'pending') RETURNING id, name, email, password_hash, role, status, created_at`,
            [name, email, password_hash]
        );
        return result.rows[0];
    }        
}
module.exports = UserRepository;