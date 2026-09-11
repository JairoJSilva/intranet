/**
 * Configuração de extensão de tema Tailwind CSS para Cartão VEM
 * Uso: Adicione no seu `tailwind.config.js`:
 *   const vemTheme = require('./id-visual/tailwind.theme.js');
 *   module.exports = { theme: { extend: vemTheme } }
 */

module.exports = {
  colors: {
    vem: {
      primary: {
        DEFAULT: '#0165aa',
        active: '#005288',
        light: '#4d90bd',
      },
      secondary: {
        DEFAULT: '#f67f1d',
      },
      tertiary: {
        DEFAULT: '#e75b32',
        hover: '#d04f29',
      },
      disabled: '#75798b',
      border: '#9ca1b6',
      cancel: '#cc0000',
      submenu: 'rgb(0, 73, 121)',
      success: {
        DEFAULT: '#74e07b',
        bg: '#c8ffd9',
        text: '#006400',
      },
      error: {
        DEFAULT: '#dc3545',
        bg: '#ffc8c8',
        text: '#dc2626',
      },
      warning: {
        DEFAULT: '#ebb42c',
        bg: '#ffeec8',
        text: '#dc6026',
      },
      info: {
        DEFAULT: '#0165aa',
        lite: '#17a2b8',
        bg: '#cff4fc',
      },
    },
  },
  backgroundImage: {
    'vem-primary-gradient': 'linear-gradient(to right, #e75b32, #f67f1d 90%)',
    'vem-secondary-gradient': 'linear-gradient(to right, #f0974e, #e67356)',
    'vem-vertical-gradient': 'linear-gradient(to bottom, #0165aa, #4d90bd 90%)',
    'vem-user-gradient': 'linear-gradient(260deg, rgba(231, 78, 39, 0.748) 34%, rgba(246, 127, 29, 0.75) 81%)',
  },
  fontFamily: {
    poppins: ['Poppins', 'sans-serif'],
  },
  borderRadius: {
    vem: '6px',
  },
};
