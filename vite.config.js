import { resolve } from 'path';
import { defineConfig } from 'vite';
import { compile } from 'sass';
import Replace from '@rollup/plugin-replace';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/Consola.ts'),
            name: 'Consola',
            fileName: 'index',
            formats: ['es']
        },
        rollupOptions: {
            plugins: [
                dts({ rollupTypes: true,  }),
                Replace({
                    __css__: compile('./lib/style.scss', { style: 'compressed' }).css,
                    preventAssignment: true,
                }),
            ]
        },
    }
});