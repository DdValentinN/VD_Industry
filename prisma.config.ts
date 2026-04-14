import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

// Use WebSocket in Node.js environments (local dev, Vercel serverless)
if (typeof WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws')
}

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter(env) {
      const pool = new Pool({ connectionString: env.DATABASE_URL })
      return new PrismaNeon(pool)
    },
  },
})
