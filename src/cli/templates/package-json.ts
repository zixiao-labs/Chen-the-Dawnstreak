export type ProjectType = 'web' | 'pwa' | 'electron' | 'tauri' | 'react-native';
export type BundlerType = 'vite' | 'nasti';

export function packageJson(projectName: string, type: ProjectType, bundler: BundlerType = 'vite'): string {
  if (type === 'react-native') {
    return rnPackageJson(projectName);
  }

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
  base.dependencies['chen-the-dawnstreak'] = '^4.0.0';

  // Tauri always uses Vite; Electron can use either
  const effectiveBundler: BundlerType = type === 'tauri' ? 'vite' : bundler;

  if (effectiveBundler === 'nasti') {
    base.devDependencies['@nasti-toolchain/nasti'] = '>=1.0.0';
    base.scripts['dev'] = 'nasti dev';
    base.scripts['build'] = 'tsc -b && nasti build';
    base.scripts['preview'] = 'nasti preview';
  } else {
    base.devDependencies['vite'] = '^6.0.0';
    base.devDependencies['@vitejs/plugin-react'] = '^4.0.0';
    base.scripts['dev'] = 'vite';
    base.scripts['build'] = 'tsc -b && vite build';
    base.scripts['preview'] = 'vite preview';
  }

  base.devDependencies['typescript'] = '^5.6.0';
  base.devDependencies['@types/react'] = '^19.0.0';
  base.devDependencies['@types/react-dom'] = '^19.0.0';

  switch (type) {
    case 'pwa':
      // PWA handled by chen vite plugin, no extra deps needed
      break;

    case 'electron':
      (base as Record<string, unknown>)['main'] =
        effectiveBundler === 'nasti' ? 'dist/main.cjs' : 'dist-electron/main.js';
      base.devDependencies['electron'] = '^41.0.0';
      base.devDependencies['electron-builder'] = '^26.0.0';

      if (effectiveBundler === 'nasti') {
        // Nasti handles main/preload compilation — no esbuild needed
        delete base.scripts['preview'];
        base.scripts['dev'] = 'nasti electron';
        base.scripts['build'] = 'nasti electron-build && electron-builder';
      } else {
        // Vite: compile main/preload separately with esbuild
        base.devDependencies['esbuild'] = '^0.25.0';
        base.scripts['build:electron-main'] =
          'esbuild electron/main.ts electron/preload.ts --bundle --platform=node --outdir=dist-electron --format=esm --external:electron';
        base.scripts['dev:electron'] = 'vite build && npm run build:electron-main && electron .';
        base.scripts['build:electron'] = 'vite build && npm run build:electron-main && electron-builder';
      }
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

function rnPackageJson(projectName: string): string {
  const pkg = {
    name: projectName,
    version: '1.0.0',
    main: 'node_modules/expo/AppEntry.js',
    scripts: {
      start: 'expo start',
      android: 'expo start --android',
      ios: 'expo start --ios',
      web: 'expo start --web',
    },
    dependencies: {
      'chen-the-dawnstreak': '^4.0.0',
      'expo': '~53.0.0',
      'expo-status-bar': '~2.0.0',
      'react': '19.0.0',
      'react-native': '0.79.0',
      '@react-navigation/native': '^7.0.0',
      '@react-navigation/native-stack': '^7.0.0',
      'react-native-screens': '~4.0.0',
      'react-native-safe-area-context': '~5.0.0',
    },
    devDependencies: {
      '@babel/core': '^7.20.0',
      'typescript': '^5.6.0',
      '@types/react': '~19.0.0',
    },
  };
  return JSON.stringify(pkg, null, 2) + '\n';
}
