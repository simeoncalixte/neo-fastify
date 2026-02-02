import type { StorybookConfig } from '@storybook/react-vite';
import type { UserConfig as ViteUserConfig } from 'vite';
import dotenv from 'dotenv';

// Load .env from project root so VITE_ vars are available to Storybook's Vite build
dotenv.config({ path: `${process.cwd()}/.env` });

const viteDefine: Record<string, string> = {};
Object.keys(process.env)
  .filter((k) => k.startsWith('VITE_'))
  .forEach((k) => {
    viteDefine[`import.meta.env.${k}`] = JSON.stringify(process.env[k]);
  });

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs'
  ],
  framework: '@storybook/react-vite',
  async viteFinal(config: ViteUserConfig, { configType }) {
    // Inject VITE_ env vars into the Vite define map so `import.meta.env.VITE_...` works
    config.define = { ...(config.define as Record<string, any> || {}), ...viteDefine };
    return config;
  }
};

export default config;