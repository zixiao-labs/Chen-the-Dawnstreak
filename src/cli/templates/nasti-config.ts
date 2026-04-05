import type { ProjectType } from './package-json.js';

export function nastiConfig(_type: ProjectType): string {
  return `import { defineConfig } from 'nasti';

export default defineConfig({
  framework: 'react',
});
`;
}
