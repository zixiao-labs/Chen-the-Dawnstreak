import fs from 'fs';
import path from 'path';
import type { ProjectType, BundlerType } from './templates/package-json.js';
import { indexHtml, mainTsx, appTsx, appCss, tsconfigJson, tsconfigAppJson, gitignore, viteEnvDts, nastiEnvDts } from './templates/base.js';
import { packageJson } from './templates/package-json.js';
import { viteConfig } from './templates/vite-config.js';
import { nastiConfig } from './templates/nasti-config.js';
import { manifest } from './templates/pwa.js';
import { electronMain, electronPreload, nastiElectronMain, nastiElectronPreload } from './templates/electron.js';
import { cargoToml, tauriConf, tauriMainRs, tauriBuildRs } from './templates/tauri.js';
import { rnAppJson, rnAppTsx, rnHomeScreen, rnTsconfigJson, rnBabelConfig, rnGitignore } from './templates/react-native.js';
import { t } from './i18n.js';

interface FileEntry {
  filePath: string;
  content: string;
}

function writeFiles(projectDir: string, files: FileEntry[]): void {
  for (const file of files) {
    const fullPath = path.join(projectDir, file.filePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, file.content, 'utf-8');
  }
}

export function scaffold(projectName: string, type: ProjectType, bundler: BundlerType = 'vite'): void {
  const projectDir = path.resolve(process.cwd(), projectName);
  const msg = t();

  if (fs.existsSync(projectDir)) {
    const entries = fs.readdirSync(projectDir);
    if (entries.length > 0) {
      console.error(msg.dirNotEmpty(projectName));
      process.exit(1);
    }
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // Tauri always uses Vite; Electron can use either
  const effectiveBundler: BundlerType = type === 'tauri' ? 'vite' : bundler;
  const useNasti = effectiveBundler === 'nasti';

  // React Native has a completely different file set
  if (type === 'react-native') {
    const files: FileEntry[] = [
      { filePath: 'App.tsx', content: rnAppTsx() },
      { filePath: 'app.json', content: rnAppJson(projectName) },
      { filePath: 'src/screens/HomeScreen.tsx', content: rnHomeScreen() },
      { filePath: 'tsconfig.json', content: rnTsconfigJson() },
      { filePath: 'babel.config.js', content: rnBabelConfig() },
      { filePath: '.gitignore', content: rnGitignore() },
      { filePath: 'package.json', content: packageJson(projectName, type) },
    ];
    writeFiles(projectDir, files);
    console.log(msg.projectCreated(projectName));
    console.log(msg.nextSteps);
    console.log(`  cd ${projectName}`);
    console.log('  npm install');
    console.log('  npm start');
    console.log('');
    return;
  }

  // Base files for all web/desktop project types
  const files: FileEntry[] = [
    { filePath: 'index.html', content: indexHtml(projectName) },
    { filePath: 'src/main.tsx', content: mainTsx() },
    { filePath: 'src/App.tsx', content: appTsx() },
    { filePath: 'src/App.css', content: appCss() },
    { filePath: 'tsconfig.json', content: tsconfigJson() },
    { filePath: 'tsconfig.app.json', content: tsconfigAppJson() },
    { filePath: '.gitignore', content: gitignore() },
    { filePath: useNasti ? 'src/nasti-env.d.ts' : 'src/vite-env.d.ts', content: useNasti ? nastiEnvDts() : viteEnvDts() },
    { filePath: 'package.json', content: packageJson(projectName, type, effectiveBundler) },
    { filePath: useNasti ? 'nasti.config.ts' : 'vite.config.ts', content: useNasti ? nastiConfig(type) : viteConfig(type) },
  ];

  // PWA-specific files
  if (type === 'pwa') {
    files.push(
      { filePath: 'public/manifest.json', content: manifest(projectName) },
      { filePath: 'public/icons/.gitkeep', content: '' },
    );
  }

  // Electron-specific files
  if (type === 'electron') {
    if (useNasti) {
      // Nasti expects main/preload under src/electron/
      files.push(
        { filePath: 'src/electron/main.ts', content: nastiElectronMain() },
        { filePath: 'src/electron/preload.ts', content: nastiElectronPreload() },
      );
    } else {
      files.push(
        { filePath: 'electron/main.ts', content: electronMain() },
        { filePath: 'electron/preload.ts', content: electronPreload() },
      );
    }
  }

  // Tauri-specific files
  if (type === 'tauri') {
    files.push(
      { filePath: 'src-tauri/Cargo.toml', content: cargoToml(projectName) },
      { filePath: 'src-tauri/tauri.conf.json', content: tauriConf(projectName) },
      { filePath: 'src-tauri/src/main.rs', content: tauriMainRs() },
      { filePath: 'src-tauri/build.rs', content: tauriBuildRs() },
      { filePath: 'src-tauri/icons/.gitkeep', content: '' },
    );
  }

  writeFiles(projectDir, files);

  console.log(msg.projectCreated(projectName));
  if (useNasti) {
    console.log(`  ${msg.bundlerLabel}`);
  }
  console.log(msg.nextSteps);
  console.log(`  cd ${projectName}`);
  console.log('  npm install');

  switch (type) {
    case 'electron':
      if (useNasti) {
        console.log(`  npm run dev           ${msg.startElectronApp}`);
      } else {
        console.log(`  npm run dev           ${msg.startWebDev}`);
        console.log(`  npm run dev:electron  ${msg.startElectronApp}`);
      }
      break;
    case 'tauri':
      console.log(`  npm run tauri:dev     ${msg.startTauriDev}`);
      break;
    default:
      console.log('  npm run dev');
      break;
  }

  console.log('');
}
