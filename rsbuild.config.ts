import { defineConfig } from '@rsbuild/core';
import { pluginDts } from 'rsbuild-plugin-dts';
import { pluginSass } from '@rsbuild/plugin-sass';

export default defineConfig({
    source: {
        entry: {
            // 开源组件入口
            index: {
                import: './src/export.ts',
                html: false,
            },
            'web-component': {
                import: './src/web-component-export.ts',
                html: false,
            },
            // 示例页面入口
            'examples/index': './src/examples/index.ts'
        }
    },
    html: {
        template: './src/examples/index.html',
        scriptLoading: 'module'
    },
    output: {
        injectStyles: true,
    },
    plugins: [pluginDts(), pluginSass()],
    tools: {
        rspack: {
            target: 'node', // 设置为 node 环境，避免浏览器特定代码
            output: {
                filename: '[name].js',
                chunkFilename: '[name].js',
                library: {
                    type: 'module'
                },
            },
            optimization: {
                splitChunks: {
                    chunks: 'async' // 只对异步加载的模块进行代码分割
                }
            },
            experiments: {
                css: true,
                outputModule: true
            }
        }
    }
});
