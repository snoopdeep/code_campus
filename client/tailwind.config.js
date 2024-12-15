
const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  // darkMode: "class", // Ensures that 'class' is used to toggle dark mode

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        feedbackFormCustomColor: "#FEDEC8",
        darkThemeColor: "#101214",
        callToActionDarkTheme:"#101214",
        callToActionLightTheme:"#0A1828",
        callToActionTextTheme:"#BFA181",
        callToActionButtonTheme:"#178582"
      },
      fontFamily: {
        // ace: ['"Poppins"', 'sans-serif'],
        // connect: ['"Roboto"', 'sans-serif'],
        ace: ['"Merriweather"', 'serif'],
        connect: ['"Lato"', 'sans-serif'],
      },
    },
  },
  plugins: [
    flowbite.plugin(),
    require("tailwind-scrollbar"),
    require("@tailwindcss/typography"),
  ],
};
