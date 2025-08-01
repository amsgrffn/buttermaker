import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import livereload from 'rollup-plugin-livereload';

import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcssImport from 'postcss-import';
import cssnano from 'cssnano';

const isDev = process.env.BUILD === 'development';

const postcssPlugins = [
	postcssImport(),
	postcssPresetEnv({
		stage: 1,
		features: {
			'nesting-rules': true,
			'custom-properties': true,
			'custom-media-queries': true
		}
	}),
	autoprefixer(),
];

if (!isDev) {
	postcssPlugins.push(
		cssnano({
			preset: 'default'
		})
	);
}

export default [
	// JavaScript build
	{
		input: 'src/js/index.js',
		output: {
			file: 'assets/built/script.js',
			format: 'iife',
			sourcemap: isDev
		},
		plugins: [
			nodeResolve({
				browser: true,
				preferBuiltins: false
			}),
			commonjs(),
			babel({
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
				presets: [
					['@babel/preset-env', {
						targets: {
							browsers: ['> 1%', 'last 2 versions']
						}
					}]
				]
			}),
			!isDev && terser(),
			isDev && livereload({
				watch: ['assets/built', '*.hbs', 'partials/**/*.hbs'],
				delay: 300
			})
		].filter(Boolean)
	},

	// CSS build
	{
		input: 'src/css/screen.css',
		output: {
			file: 'assets/built/screen.css'
		},
		plugins: [
			postcss({
				extract: true,
				minimize: !isDev,
				sourceMap: isDev,
				plugins: postcssPlugins
			})
		]
	}
];