import { createInterface } from 'readline';

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

export async function select(message: string, options: SelectOption[]): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log(message);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}) ${opt.label}`);
  });

  return new Promise((resolve) => {
    const ask = () => {
      rl.question('> ', (answer) => {
        const index = parseInt(answer.trim(), 10) - 1;
        if (index >= 0 && index < options.length) {
          rl.close();
          resolve(options[index].value);
        } else {
          console.log(`  请输入 1-${options.length} 之间的数字`);
          ask();
        }
      });
    };
    ask();
  });
}
