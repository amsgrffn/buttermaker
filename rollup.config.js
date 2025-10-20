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

// PostCSS plugins for CSS processing
const postcssPlugins = [
  postcssImport(),
  postcssPresetEnv({
    stage: 1,
    features: {
      'nesting-rules': true,
      'custom-properties': true,
      'custom-media-queries': true,
    },
  }),
  autoprefixer(),
];

// Add CSS minification in production
if (!isDev) {
  postcssPlugins.push(
    cssnano({
      preset: 'default',
    }),
  );
}

// Live reload setup for development
const liveReloadConfig = isDev
  ? livereload({
      watch: ['assets/built', '*.hbs', 'partials/**/*.hbs', 'members/**/*.hbs'],
      verbose: true,
      port: 35729,
      delay: 500,
    })
  : null;

export default [
  // JavaScript build configuration
  {
    input: 'src/js/index.js',
    output: {
      dir: 'assets/built', // Output to directory (not single file)
      format: 'es', // ES modules format (supports code-splitting)
      sourcemap: isDev,
      entryFileNames: 'script.js', // Main file name
      chunkFileNames: 'chunks/[name]-[hash].js', // Dynamic chunks go here
      compact: !isDev,
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['> 1%', 'last 2 versions'],
              },
              modules: false,
            },
          ],
        ],
      }),
      !isDev &&
        terser({
          compress: {
            drop_console: true,
            passes: 2,
          },
          format: {
            comments: false,
          },
        }),
      liveReloadConfig,
    ].filter(Boolean),
  },

  // CSS build configuration (unchanged)
  {
    input: 'src/css/screen.css',
    output: {
      file: 'assets/built/screen.css',
    },
    plugins: [
      postcss({
        extract: true,
        minimize: !isDev,
        sourceMap: isDev,
        plugins: postcssPlugins,
      }),
    ],
  },
];
