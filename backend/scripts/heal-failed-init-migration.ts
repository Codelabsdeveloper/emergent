import { execSync } from 'child_process';

const FAILED_INIT = '20260920043000_init_postgresql';

/**
 * An earlier deploy recorded this migration as failed (UTF-8 BOM in SQL).
 * Prisma P3009 blocks all later deploys until that row is marked rolled back.
 * Safe to retry: the BOM error failed at parse time, so no tables were created.
 */
try {
  execSync(`npx prisma migrate resolve --rolled-back ${FAILED_INIT}`, {
    stdio: 'inherit',
  });
} catch {
  // Already applied, already rolled back, or never recorded.
}

execSync('npx prisma migrate deploy', { stdio: 'inherit' });
