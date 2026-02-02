// Utility helpers for environment configuration validation
export function ensureJwtSecretConfigured(envVarName = 'JWT_SECRET'): void {
  const jwtSecret = process.env[envVarName];
  if (!jwtSecret || jwtSecret.length < 32) {
    console.error(`FATAL: Environment variable ${envVarName} must be set and at least 32 characters long.`)
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      console.error('Generate a secure secret with: openssl rand -hex 32')
    }
    // Exit process to avoid starting with insecure config
    process.exit(1)
  }
}

export default ensureJwtSecretConfigured;
