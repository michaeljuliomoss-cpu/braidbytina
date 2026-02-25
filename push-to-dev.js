const fs = require('fs');
const { execSync } = require('child_process');

console.log("Fetching private key from production...");
let key = execSync('npx convex env get --prod GOOGLE_CALENDAR_PRIVATE_KEY', { encoding: 'utf-8' }).trim();

// Format it for dotenv
const escapedKey = key.replace(/\r/g, '').replace(/\n/g, '\\n');

const envContent = `GOOGLE_CALENDAR_CLIENT_EMAIL="michael@braidsbytina-calendar.iam.gserviceaccount.com"
GOOGLE_CALENDAR_PRIVATE_KEY="${escapedKey}"
`;

fs.writeFileSync('temp-dev.env', envContent);

console.log("Updating dev environments from file...");
execSync('npx convex env update temp-dev.env', { stdio: 'inherit' });

console.log("Done. Cleaning up...");
fs.unlinkSync('temp-dev.env');
