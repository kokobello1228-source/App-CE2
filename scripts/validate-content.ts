/* Content check run before each build: npm run validate */
import { validateAll } from '../src/content/validate';

const problems = validateAll();
if (problems.length > 0) {
  console.error(`✗ ${problems.length} problem(s) found:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('✓ All skills and content banks are valid.');
