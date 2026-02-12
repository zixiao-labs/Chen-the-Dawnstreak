import fs from 'fs';
import path from 'path';
import type { ProjectType } from './templates/package-json.js';
import { indexHtml, mainTsx, appTsx, appCss, tsconfigJson, tsconfigAppJson, gitignore, viteEnvDts } from './templates/base.js';
import { packageJson } from './templates/package-json.js';
import { viteConfig } from './templates/vite-config.js';
import { manifest, registerSw } from './templates/pwa.js';
import { electronMain, electronPreload } from './templates/electron.js';
import { cargoToml, tauriConf, tauriMainRs, tauriBuildRs } from './templates/tauri.js';

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

export function scaffold(projectName: string, type: ProjectType): void {
  const projectDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectDir)) {
    const entries = fs.readdirSync(projectDir);
    if (entries.length > 0) {
      console.error(`\n✘ 目录 "${projectName}" 已存在且不为空。`);
      process.exit(1);
    }
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // Base files for all project types
  const files: FileEntry[] = [
    { filePath: 'index.html', content: indexHtml(projectName) },
    { filePath: 'src/main.tsx', content: mainTsx() },
    { filePath: 'src/App.tsx', content: appTsx() },
    { filePath: 'src/App.css', content: appCss() },
    { filePath: 'tsconfig.json', content: tsconfigJson() },
    { filePath: 'tsconfig.app.json', content: tsconfigAppJson() },
    { filePath: '.gitignore', content: gitignore() },
    { filePath: 'src/vite-env.d.ts', content: viteEnvDts() },
    { filePath: 'package.json', content: packageJson(projectName, type) },
    { filePath: 'vite.config.ts', content: viteConfig(type) },
  ];

  // PWA-specific files
  if (type === 'pwa') {
    files.push(
      { filePath: 'public/manifest.json', content: manifest(projectName) },
      { filePath: 'public/icons/.gitkeep', content: '' },
      { filePath: 'src/register-sw.ts', content: registerSw() },
    );
  }

  // Electron-specific files
  if (type === 'electron') {
    files.push(
      { filePath: 'electron/main.ts', content: electronMain() },
      { filePath: 'electron/preload.ts', content: electronPreload() },
    );
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

  console.log(`\n✔ 项目已创建于 ./${projectName}\n`);
  console.log('下一步:');
  console.log(`  cd ${projectName}`);
  console.log('  npm install');

  switch (type) {
    case 'electron':
      console.log('  npm run dev           # 启动 Web 开发服务器');
      console.log('  npm run dev:electron  # 启动 Electron 应用');
      break;
    case 'tauri':
      console.log('  npm run tauri:dev     # 启动 Tauri 开发模式');
      break;
    default:
      console.log('  npm run dev');
      break;
  }

  console.log('');
}
