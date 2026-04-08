import { createInterface } from 'readline';
import { t } from './i18n.js';

export async function text(message: string, defaultValue?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  return new Promise((resolve) => {
    rl.question(`${message}${suffix}: `, (answer) => {
      rl.close();
      const result = answer.trim();
      resolve(result || defaultValue || '');
    });
  });
}

export interface SelectOption {
  label: string;
  value: string;
}

export async function select(message: string, options: SelectOption[], defaultIndex?: number): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(message);
  options.forEach((opt, i) => {
    const marker = defaultIndex === i ? '*' : ' ';
    console.log(`  ${marker}${i + 1}) ${opt.label}`);
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question('> ', (answer) => {
        const trimmed = answer.trim();
        if (trimmed === '' && defaultIndex !== undefined) {
          rl.close();
          resolve(options[defaultIndex].value);
          return;
        }
        const index = parseInt(trimmed, 10) - 1;
        if (index >= 0 && index < options.length) {
          rl.close();
          resolve(options[index].value);
        } else {
          console.log(t().enterNumber(options.length));
          ask();
        }
      });
    };
    ask();
  });
}
