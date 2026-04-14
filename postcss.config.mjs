/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, /* <-- A mudança está aqui! */
    autoprefixer: {},
  },
};
export default config;