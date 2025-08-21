import { defineConfig } from '@rsbuild/core';
import { pluginDts } from 'rsbuild-plugin-dts';

export default defineConfig({
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
