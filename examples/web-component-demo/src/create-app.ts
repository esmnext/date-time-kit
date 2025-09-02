import { createApp } from 'vue';
import App from './app.vue';

export function createVueApp() {
    const app = createApp(App);
    // app.config.compilerOptions.isCustomElement = tag => tag.startsWith('dt-');
    return {
        app
    };
}
