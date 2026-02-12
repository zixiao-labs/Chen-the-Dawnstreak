import type { ProjectType } from './package-json.js';

export function viteConfig(type: ProjectType): string {
  const imports: string[] = [
    `import { defineConfig } from 'vite';`,
    `import react from '@vitejs/plugin-react';`,
    `import { chen } from 'chen-the-dawnstreak/vite-plugin';`,
  ];

  const plugins: string[] = ['react()'];

  switch (type) {
    case 'pwa':
      plugins.push(`chen({ pwa: true })`);
      break;
    case 'electron':
      plugins.push(`chen()`);
      break;
    case 'tauri':
      plugins.push(`chen()`);
      break;
    default:
      plugins.push(`chen()`);
      break;
  }

  const pluginsStr = plugins.map((p) => `    ${p},`).join('\n');

  let serverConfig = '';
  if (type === 'tauri') {
    serverConfig = `
  server: {
    strictPort: true,
  },`;
  }

  return `${imports.join('\n')}

export default defineConfig({
  plugins: [
${pluginsStr}
  ],${serverConfig}
});
`;
}
