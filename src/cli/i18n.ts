export type Locale = 'zh-CN' | 'en';

export interface Messages {
  title: string;
  projectName: string;
  defaultProjectName: string;
  invalidProjectName: string;
  selectProjectType: string;
  projectTypeWeb: string;
  projectTypePwa: string;
  projectTypeElectron: string;
  projectTypeTauri: string;
  selectBundler: string;
  bundlerVite: string;
  bundlerNasti: string;
  dirNotEmpty: (name: string) => string;
  projectCreated: (name: string) => string;
  bundlerLabel: string;
  nextSteps: string;
  startWebDev: string;
  startElectronApp: string;
  startTauriDev: string;
  startDev: string;
  enterNumber: (max: number) => string;
  selectLanguage: string;
  error: string;
}

const zhCN: Messages = {
  title: '赤刃明霄陈 - 项目创建工具',
  projectName: '项目名称',
  defaultProjectName: 'my-chen-app',
  invalidProjectName: '✘ 无效的项目名称',
  selectProjectType: '选择项目类型:',
  projectTypeWeb: 'Web',
  projectTypePwa: 'Web + PWA',
  projectTypeElectron: 'Desktop (Electron)',
  projectTypeTauri: 'Desktop (Tauri)',
  selectBundler: '选择打包器:',
  bundlerVite: 'Vite (稳定)',
  bundlerNasti: 'Nasti (更快，基于 Rolldown + OXC)',
  dirNotEmpty: (name) => `\n✘ 目录 "${name}" 已存在且不为空。`,
  projectCreated: (name) => `\n✔ 项目已创建于 ./${name}\n`,
  bundlerLabel: '打包器: Nasti (Rolldown + OXC)',
  nextSteps: '下一步:',
  startWebDev: '# 启动 Web 开发服务器',
  startElectronApp: '# 启动 Electron 应用',
  startTauriDev: '# 启动 Tauri 开发模式',
  startDev: '',
  enterNumber: (max) => `  请输入 1-${max} 之间的数字`,
  selectLanguage: 'Select language / 选择语言:',
  error: '发生错误:',
};

const en: Messages = {
  title: 'Chen the Dawnstreak - Project Scaffolding Tool',
  projectName: 'Project name',
  defaultProjectName: 'my-chen-app',
  invalidProjectName: '✘ Invalid project name',
  selectProjectType: 'Select project type:',
  projectTypeWeb: 'Web',
  projectTypePwa: 'Web + PWA',
  projectTypeElectron: 'Desktop (Electron)',
  projectTypeTauri: 'Desktop (Tauri)',
  selectBundler: 'Select bundler:',
  bundlerVite: 'Vite (stable)',
  bundlerNasti: 'Nasti (faster, Rolldown + OXC based)',
  dirNotEmpty: (name) => `\n✘ Directory "${name}" already exists and is not empty.`,
  projectCreated: (name) => `\n✔ Project created at ./${name}\n`,
  bundlerLabel: 'Bundler: Nasti (Rolldown + OXC)',
  nextSteps: 'Next steps:',
  startWebDev: '# Start web dev server',
  startElectronApp: '# Start Electron app',
  startTauriDev: '# Start Tauri dev mode',
  startDev: '',
  enterNumber: (max) => `  Please enter a number between 1-${max}`,
  selectLanguage: 'Select language / 选择语言:',
  error: 'Error:',
};

const locales: Record<Locale, Messages> = { 'zh-CN': zhCN, en };

let currentMessages: Messages = zhCN;

export function setLocale(locale: Locale): void {
  currentMessages = locales[locale];
}

export function t(): Messages {
  return currentMessages;
}

export function detectLocale(): Locale {
  const lang = process.env['LANG'] || process.env['LC_ALL'] || process.env['LANGUAGE'] || '';
  if (lang.startsWith('zh')) return 'zh-CN';
  return 'en';
}
