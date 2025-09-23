# Claude Development Notes

## Package Manager
- **Use PNPM** for this project, not npm or yarn
- Install dependencies: `pnpm install`
- Add dependencies: `pnpm add <package>`
- Add dev dependencies: `pnpm add -D <package>`

## Commands
- **TypeScript check**: `pnpm run typecheck`
- **Lint**: `pnpm run lint`
- **Build**: `pnpm run build`
- **Dev server**: `pnpm run dev`

## Project Structure
- Frontend: Next.js application in `/frontend` directory
- Backend: Express.js API server in `/src` directory
- Database: PostgreSQL with Knex.js migrations

## Important Notes
- Always run TypeScript type checking after making changes
- Use PNPM for all package management operations
- Follow existing code conventions and patterns