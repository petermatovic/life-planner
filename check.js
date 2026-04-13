const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log("No typescript errors");
} catch (e) {
  console.log("Errors found");
}
