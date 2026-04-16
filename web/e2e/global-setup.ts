import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

export default async function globalSetup() {
  const apiDir = path.resolve(fileURLToPath(import.meta.url), '../../../api');
  // Drop and recreate the test database with a clean schema
  execSync('npx prisma migrate reset --force', {
    cwd: apiDir,
    env: { ...process.env, DATABASE_URL: 'file:./test.db', PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes' },
    stdio: 'inherit',
  });
}
