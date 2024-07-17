import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'atlas',
    footer: 'power by change',
  },
  publicPath: '/atlas/',
  base:'/atlas',
  cssPublicPath:'/atlas'
});
