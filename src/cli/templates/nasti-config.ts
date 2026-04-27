import type { ProjectType } from './package-json.js';

export function nastiConfig(type: ProjectType): string {
  if (type === 'electron') {
    return `import { defineConfig } from '@nasti-toolchain/nasti';

export default defineConfig({
  target: 'electron',
  framework: 'react',

  electron: {
    main: 'src/electron/main.ts',
    preload: 'src/electron/preload.ts',
    mainFormat: 'cjs',
    preloadFormat: 'cjs',
    nodeTarget: 'node22',
    autoRestart: true,
    minVersion: 41,
    external: ['electron'],
  },
});
`;
  }

  return `import { defineConfig } from '@nasti-toolchain/nasti';

export default defineConfig({
  framework: 'react',
});
`;
}
