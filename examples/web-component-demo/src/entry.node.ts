import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['npm:vue']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                chain(context) {
                    context.chain.module
                        .rule('vue')
                        .use('vue-loader')
                        .tap((options) => {
                            return {
                                ...options,
                                compilerOptions: {
                                    isCustomElement: (tag: string) =>
                                        tag.startsWith('dt-')
                                }
                            };
                        });
                }
            })
        );
    },

    async postBuild(esmx) {
        const rc = await esmx.render();
        esmx.writeSync(esmx.resolvePath('dist/client', 'index.html'), rc.html);
    },

    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server started: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
