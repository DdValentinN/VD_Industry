import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { neonConfig, Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

if (typeof WebSocket === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  neonConfig.webSocketConstructor = require('ws')
}

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  migrate: {
    async adapter(env: NodeJS.ProcessEnv) {
      const pool = new Pool({ connectionString: env['DATABASE_URL'] })
      return new PrismaNeon(pool)
    },
  },
})
