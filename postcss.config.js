// postcss.config.js
export default {
  plugins: {
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', {
              discardComments: {
                removeAll: true,
              },
              normalizeWhitespace: true,
              minifyFontValues: true,
              minifySelectors: true,
              mergeLonghand: true,
              mergeRules: true,
            }],
          },
        }
      : {}),
  },
};