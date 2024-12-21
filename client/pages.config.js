export default {
  build: {
    command: "npm run build",
    directory: "build",
    environment: {
      NODE_VERSION: "20"
    }
  },
  headers: {
    "/*": {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(self), geolocation=()",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.workers.dev https://api.openai.com;"
    },
    "/static/*": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  }
} 