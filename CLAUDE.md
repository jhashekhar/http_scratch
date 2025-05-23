# HTTP Server from Scratch

## Commands
- Run server: `npm start`
- Development mode (auto-restart): `npm run dev`
- Production mode: `npm run start:prod`
- Debug mode: `npm run start:prod:debug`
- Debug with breakpoints: `npm run start:prod:debug:inspect`

## Code Style Guidelines
- Use ES modules with explicit imports (e.g., `import net from 'net'`)
- Prefer `const` over `let` where possible
- Use camelCase for variables and functions
- Use proper error handling with try/catch blocks for async code
- Log errors with context information
- Use 2-space indentation
- Add meaningful comments for complex logic
- Minimize external dependencies
- Keep implementation as low-level as possible for learning purposes
- Implement proper TCP/HTTP protocol handling manually