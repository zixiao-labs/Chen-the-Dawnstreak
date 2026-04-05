#!/usr/bin/env node

import { text, select } from './prompts.js';
import { scaffold } from './scaffold.js';
import type { ProjectType, BundlerType } from './templates/package-json.js';

async function main(): Promise<void> {
  console.log('\n赤刃明霄陈 - 项目创建工具\n');

  // Get project name from argv or prompt
  let projectName = process.argv[2];
  if (!projectName) {
    projectName = await text('项目名称', 'my-chen-app');
  }

  // Validate project name
  if (!projectName || /[<>:"/\\|?*]/.test(projectName)) {
    console.error('✘ 无效的项目名称');
    process.exit(1);
  }

  // Select project type
  const type = await select('选择项目类型:', [
    { label: 'Web', value: 'web' },
    { label: 'Web + PWA', value: 'pwa' },
    { label: 'Desktop (Electron)', value: 'electron' },
    { label: 'Desktop (Tauri)', value: 'tauri' },
  ]) as ProjectType;

  // Select bundler (only for web/pwa — electron/tauri require Vite)
  let bundler: BundlerType = 'vite';
  if (type === 'web' || type === 'pwa') {
    bundler = await select('选择打包器:', [
      { label: 'Vite (稳定)', value: 'vite' },
      { label: 'Nasti (更快，基于 Rolldown + OXC)', value: 'nasti' },
    ]) as BundlerType;
  }

  // Scaffold the project
  scaffold(projectName, type, bundler);
}

main().catch((err: unknown) => {
  console.error('发生错误:', err);
  process.exit(1);
});
