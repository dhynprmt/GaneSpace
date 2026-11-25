/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        royal: "#102B69",
        primary: "#1649B8",
        electric: "#1685F5",
        softblue: "#EAF1FF",
        cloud: "#F5F7FC",
        ink: "#172033",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};