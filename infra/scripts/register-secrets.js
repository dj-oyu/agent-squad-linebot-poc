const { SecretsManagerClient, CreateSecretCommand, PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const requiredSecrets = [
  'LINE_CHANNEL_SECRET',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'OPENAI_API_KEY',
  'GEMINI_API_KEY',
  'GROK_API_KEY',
  'GROQ_API_KEY',
  'ADMIN_LINE_USER_ID'
];

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-northeast-1';
const client = new SecretsManagerClient({ region });

async function upsertSecret(name, value) {
  try {
    await client.send(new CreateSecretCommand({ Name: name, SecretString: value }));
    console.log(`Created secret ${name}`);
  } catch (err) {
    if (err.name === 'ResourceExistsException') {
      await client.send(new PutSecretValueCommand({ SecretId: name, SecretString: value }));
      console.log(`Updated secret ${name}`);
    } else {
      console.error(`Failed to set secret ${name}:`, err.message || err);
    }
  }
}

(async () => {
  for (const key of requiredSecrets) {
    const value = process.env[key];
    if (!value) {
      console.warn(`Env var ${key} not set, skipping`);
      continue;
    }
    await upsertSecret(key, value);
  }
})();
