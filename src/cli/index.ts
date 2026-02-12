#!/usr/bin/env node

import { text, select } from './prompts.js';
import { scaffold } from './scaffold.js';
import type { ProjectType } from './templates/package-json.js';

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

  // Scaffold the project
  scaffold(projectName, type);
}

main().catch((err: unknown) => {
  console.error('发生错误:', err);
  process.exit(1);
});
