import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';

const mode = process.env.NODE_ENV;
export default {
    input: 'src/index.js',
    output: {
        file: 'static/bundle.js',
        format: 'iife'
    },
    plugins: [
        replace({
            'process.browser': true,
            'process.env.NODE_ENV': JSON.stringify(mode)
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
    ]
};