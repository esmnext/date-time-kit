import { defineConfig } from '@rsbuild/core';
import { pluginDts } from 'rsbuild-plugin-dts';

export default defineConfig({
    source: {
        entry: {
            // 开源组件入口
            index: {
                import: './src/export.ts',
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
    plugins: [pluginDts()],
    tools: {
        rspack: {
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
            },
            module: {
                // suppress sass scss
                rules: [
                    {
                        test: /\.s[ac]ss$/i,
                        use: [{
                            loader: 'sass-loader',
                            options: {
                                api: 'modern-compiler',
                                implementation: require.resolve('sass-embedded'),
                            }
                        }],
                        // set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
                        type: 'css/auto',
                    }
                ]
            }
        }
    }
});
