import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import path from 'path'

const env = process.env.NODE_ENV || 'development'

loadEnv(env, process.cwd())
loadEnv(env, path.resolve(process.cwd(), '../..'))

module.exports = defineConfig({
  admin: {
    vite: (config) => {
      return {
        optimizeDeps: {
          include: [
            ...(config.optimizeDeps?.include ?? []),
            "react",
            "react-dom",
            "gutenberg-block-kit",
            "gutenberg-block-kit/editor",
          ],
          force: true,
        },
        resolve: {
          dedupe: ["react", "react-dom", "@wordpress/element"],
          alias: {
            "gutenberg-block-kit/editor":
              path.resolve(__dirname, "node_modules/gutenberg-block-kit/dist/editor.cjs"),
          },
        },
      }
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: { providers: [] },
    },
    {
      resolve: "./src/modules/feedback",
    },
    {
      resolve: "./src/modules/cms",
    },
    {
      resolve: "./src/modules/contact",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            options: {
              backend_url: process.env.BACKEND_URL || "http://localhost:9000/static",
            },
          },
        ],
      },
    },
  ],
})