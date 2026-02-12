export function cargoToml(projectName: string): string {
  return `[package]
name = "${projectName}"
version = "0.0.0"
description = ""
edition = "2021"

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
`;
}

export function tauriConf(projectName: string): string {
  return JSON.stringify(
    {
      $schema: 'https://raw.githubusercontent.com/nickelpack/tauri/dev/crates/tauri-config-schema/schema.json',
      productName: projectName,
      version: '0.0.0',
      identifier: `com.${projectName.replace(/[^a-zA-Z0-9]/g, '')}.app`,
      build: {
        frontendDist: '../dist',
        devUrl: 'http://localhost:5173',
        beforeDevCommand: 'npm run dev',
        beforeBuildCommand: 'npm run build',
      },
      app: {
        title: projectName,
        windows: [
          {
            title: projectName,
            width: 1200,
            height: 800,
          },
        ],
        security: {
          csp: null,
        },
      },
      bundle: {
        active: true,
        targets: 'all',
        icon: [
          'icons/32x32.png',
          'icons/128x128.png',
          'icons/128x128@2x.png',
          'icons/icon.icns',
          'icons/icon.ico',
        ],
      },
    },
    null,
    2,
  ) + '\n';
}

export function tauriMainRs(): string {
  return `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`;
}

export function tauriBuildRs(): string {
  return `fn main() {
    tauri_build::build()
}
`;
}
