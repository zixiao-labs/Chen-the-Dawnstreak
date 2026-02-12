export function indexHtml(projectName: string): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function mainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

export function appTsx(): string {
  return `import { ChenRouter, Routes, Route } from 'chen-the-dawnstreak';
import './App.css';

function Home() {
  return (
    <mdui-card style={{ padding: '2rem', maxWidth: 600, margin: '2rem auto' }}>
      <h1>欢迎使用赤刃明霄陈</h1>
      <p>基于 MDUI 和 React 的全栈框架</p>
      <mdui-button variant="filled">开始使用</mdui-button>
    </mdui-card>
  );
}

function App() {
  return (
    <ChenRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </ChenRouter>
  );
}

export default App;
`;
}

export function appCss(): string {
  return `#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
`;
}

export function tsconfigJson(): string {
  return `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`;
}

export function tsconfigAppJson(): string {
  return `{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
`;
}

export function gitignore(): string {
  return `# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules/

# Build
dist/
dist-ssr/

# Editor
.vscode/*
!.vscode/extensions.json
.idea

# OS
.DS_Store
*.local

# Env
.env
.env.*
!.env.example
`;
}

export function viteEnvDts(): string {
  return `/// <reference types="vite/client" />
`;
}
