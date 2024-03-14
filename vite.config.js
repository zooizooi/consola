import { resolve } from 'path';
import { defineConfig } from 'vite';
import * as Sass from 'sass';
import Replace from '@rollup/plugin-replace';
import Autoprefixer from 'autoprefixer';
import Postcss from 'postcss';
import dts from 'vite-plugin-dts';

async function compileCss() {
    const css = Sass.renderSync({
        file: 'lib/style.scss',
        outputStyle: 'compressed',
    }).css.toString();

    const result = await Postcss([Autoprefixer]).process(css, {
        from: undefined,
    });
    return result.css.replace(/\n/g, '').replace(/'/g, '\\\'').trim();
}

const css = await compileCss();

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
                dts({ rollupTypes: true }),
                Replace({
                    __css__: css,
                    preventAssignment: true,
                }),
            ]
        },
    }
});