export function manifest(projectName: string): string {
  return JSON.stringify(
    {
      name: projectName,
      short_name: projectName,
      description: `${projectName} - Powered by 赤刃明霄陈`,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#6750a4',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    null,
    2,
  ) + '\n';
}

export function registerSw(): string {
  return `if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
`;
}
