// const flowbite = require("flowbite-react/tailwind");
// /** @type {import('tailwindcss').Config} */
// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
//   theme: {
//     extend: {},
//   },
//   plugins: [
//     flowbite.plugin(),
//     require("tailwind-scrollbar"),
//     require("@tailwindcss/typography"),
//   ],
// };

const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,ts,jsx,tsx}", 
    flowbite.content()
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite.plugin(),
    require("tailwind-scrollbar"),
    require("@tailwindcss/typography")
  ],
};