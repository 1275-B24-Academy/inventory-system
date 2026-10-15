class RefreshTokenRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ userId, tokenHash, familyId, expiresAt }) {
    const result = await this.pool.query(
      `INSERT INTO refresh_tokens (
        user_id,
        token_hash,
        family_id,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, family_id, created_at, expires_at`,
      [userId, tokenHash, familyId, expiresAt]
    );

    return result.rows[0];
  }
  async findByTokenHash(tokenHash) {
    const result = await this.pool.query(
        `SELECT
        id,
        user_id,
        token_hash,
        family_id,
        expires_at,
        revoked_at
        FROM refresh_tokens
        WHERE token_hash = $1`,
        [tokenHash]
    );

    return result.rows[0] ?? null;
    }
   async rotate({ oldTokenId, tokenHash, familyId, expiresAt }) {
        const client = await this.pool.connect();

        try {
            await client.query("BEGIN");

            const revoked = await client.query(
            `UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = $1
                AND revoked_at IS NULL
                AND expires_at > NOW()
            RETURNING id`,
            [oldTokenId]
            );

            // Token đã hết hạn, đã bị thu hồi hoặc đã được đổi trước đó.
            if (revoked.rowCount !== 1) {
            await client.query("ROLLBACK");
            return false;
            }

            await client.query(
            `INSERT INTO refresh_tokens (
                user_id,
                token_hash,
                family_id,
                expires_at
            )
            SELECT user_id, $2, $3, $4
            FROM refresh_tokens
            WHERE id = $1`,
            [oldTokenId, tokenHash, familyId, expiresAt]
            );

            await client.query("COMMIT");
            return true;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
        }

        async revokeFamily(familyId) {
        await this.pool.query(
            `UPDATE refresh_tokens
            SET revoked_at = COALESCE(revoked_at, NOW())
            WHERE family_id = $1`,
            [familyId]
        );
        }
        async revokeById(id) {
        const result = await this.pool.query(
            `UPDATE refresh_tokens
            SET revoked_at = NOW()
            WHERE id = $1
            AND revoked_at IS NULL
            RETURNING id`,
            [id]
        );

        return result.rowCount === 1;
    }
}

module.exports = RefreshTokenRepository;