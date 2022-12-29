const plugin = require('tailwindcss/plugin')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      zIndex: {
        // z-index for something being auto-animated is 100
        'over-animation': 1000,
      },
    },
  },
  daisyui: {
    themes: ['dracula'],
  },
  plugins: [
    require('daisyui'),
    require('tailwindcss-hocus'),
    plugin(({ addVariant, matchVariant }) => {
      addVariant('fullscreen', '&:fullscreen')
      addVariant('not-fullscreen', '&:not(:fullscreen)')
      addVariant('in-fullscreen', ':fullscreen &')
      addVariant('not-in-fullscreen', ':not(:fullscreen) &')

      const addModifierIfNeeded = (modifier, prefix) => {
        return modifier ? `${prefix}\\/${modifier}` : prefix
      }

      matchVariant(
        'group',
        (value, { modifier }) => {
          const selector = `:merge(.${addModifierIfNeeded(
            modifier,
            'group'
          )}):${value} &`

          return [selector]
        },
        {
          values: {
            fullscreen: 'fullscreen',
            'not-fullscreen': 'not(:fullscreen)',
          },
        }
      )
    }),
  ],
}
