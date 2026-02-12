export type ProjectType = 'web' | 'pwa' | 'electron' | 'tauri';

export function packageJson(projectName: string, type: ProjectType): string {
  const base = {
    name: projectName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {} as Record<string, string>,
    dependencies: {} as Record<string, string>,
    devDependencies: {} as Record<string, string>,
  };

  // Common deps
  base.dependencies['react'] = '^19.0.0';
  base.dependencies['react-dom'] = '^19.0.0';
  base.dependencies['chen-the-dawnstreak'] = '^2.0.0';

  // Common devDeps
  base.devDependencies['vite'] = '^6.0.0';
  base.devDependencies['@vitejs/plugin-react'] = '^4.0.0';
  base.devDependencies['typescript'] = '^5.6.0';
  base.devDependencies['@types/react'] = '^19.0.0';
  base.devDependencies['@types/react-dom'] = '^19.0.0';

  // Common scripts
  base.scripts['dev'] = 'vite';
  base.scripts['build'] = 'tsc -b && vite build';
  base.scripts['preview'] = 'vite preview';

  switch (type) {
    case 'pwa':
      // PWA handled by chen vite plugin, no extra deps needed
      break;

    case 'electron':
      base.devDependencies['electron'] = '^35.0.0';
      base.devDependencies['electron-builder'] = '^26.0.0';
      base.scripts['dev:electron'] = 'vite build && electron .';
      base.scripts['build:electron'] = 'vite build && electron-builder';
      break;

    case 'tauri':
      base.dependencies['@tauri-apps/api'] = '^2.0.0';
      base.devDependencies['@tauri-apps/cli'] = '^2.0.0';
      base.scripts['dev'] = 'vite';
      base.scripts['tauri'] = 'tauri';
      base.scripts['tauri:dev'] = 'tauri dev';
      base.scripts['tauri:build'] = 'tauri build';
      break;
  }

  return JSON.stringify(base, null, 2) + '\n';
}
