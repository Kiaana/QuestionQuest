/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './templates/**/*.html',
    // 如果你的JavaScript文件中也有类名，请包含它们
    './static/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

