#!/usr/bin/env node

import { text, select } from './prompts.js';
import { scaffold } from './scaffold.js';
import type { ProjectType, BundlerType } from './templates/package-json.js';
import { type Locale, setLocale, t, detectLocale } from './i18n.js';

async function main(): Promise<void> {
  // Language selection
  const detectedLocale = detectLocale();
  const locale = await select(t().selectLanguage, [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en' },
  ], detectedLocale === 'zh-CN' ? 0 : 1) as Locale;
  setLocale(locale);

  const msg = t();
  console.log(`\n${msg.title}\n`);

  // Get project name from argv or prompt
  let projectName = process.argv[2];
  if (!projectName) {
    projectName = await text(msg.projectName, msg.defaultProjectName);
  }

  // Validate project name
  if (!projectName || /[<>:"/\\|?*]/.test(projectName)) {
    console.error(msg.invalidProjectName);
    process.exit(1);
  }

  // Select project type
  const type = await select(msg.selectProjectType, [
    { label: msg.projectTypeWeb, value: 'web' },
    { label: msg.projectTypePwa, value: 'pwa' },
    { label: msg.projectTypeElectron, value: 'electron' },
    { label: msg.projectTypeTauri, value: 'tauri' },
    { label: msg.projectTypeReactNative, value: 'react-native' },
  ]) as ProjectType;

  // Select bundler (web/pwa/electron — Tauri requires Vite, React Native doesn't use a bundler)
  let bundler: BundlerType = 'vite';
  if (type === 'web' || type === 'pwa' || type === 'electron') {
    bundler = await select(msg.selectBundler, [
      { label: msg.bundlerVite, value: 'vite' },
      { label: msg.bundlerNasti, value: 'nasti' },
    ]) as BundlerType;
  }

  // Scaffold the project
  scaffold(projectName, type, bundler);
}

main().catch((err: unknown) => {
  console.error(t().error, err);
  process.exit(1);
});
