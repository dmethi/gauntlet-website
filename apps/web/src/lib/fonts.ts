import localFont from 'next/font/local';
import {
  Fira_Sans, // Technical, clean
  IBM_Plex_Sans, // Corporate, modern
  Inter, // Modern, very popular, excellent for UI
  Lato, // Humanist, warm feeling
  Open_Sans, // Friendly, widely used
  Poppins, // Geometric, modern
  Roboto, // Classic Google font, highly readable
  Source_Sans_3, // Clean, professional (updated name)
  Work_Sans, // Versatile, great for data
} from 'next/font/google';

// Current Montserrat setup (all weights)
export const montserrat = localFont({
  src: [
    {
      path: '../../public/fonts/Montserrat-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-ThinItalic.ttf',
      weight: '100',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-ExtraLightItalic.ttf',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-LightItalic.ttf',
      weight: '300',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-MediumItalic.ttf',
      weight: '500',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-SemiBoldItalic.ttf',
      weight: '600',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-BoldItalic.ttf',
      weight: '700',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-ExtraBoldItalic.ttf',
      weight: '800',
      style: 'italic',
    },
    {
      path: '../../public/fonts/Montserrat-Black.ttf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Montserrat-BlackItalic.ttf',
      weight: '900',
      style: 'italic',
    },
  ],
  variable: '--font-montserrat',
  display: 'swap',
});

// Geizer (brand font)
export const geizer = localFont({
  src: '../../public/fonts/Geizer.otf',
  variable: '--font-geizer',
  display: 'swap',
});

// Font alternatives (Google Fonts - no files needed!)

// 1. INTER (most popular modern choice)
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// 2. ROBOTO (classic, highly readable)
export const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

// 3. WORK SANS (versatile, great for data)
export const workSans = Work_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

// 4. OPEN SANS (friendly, versatile)
export const openSans = Open_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

// 5. LATO (humanist, warm)
export const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
});

// 6. SOURCE SANS 3 (clean, professional)
export const sourceSans = Source_Sans_3({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
});

// 7. POPPINS (geometric, modern)
export const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

// 8. FIRA SANS (technical, clean)
export const firaSans = Fira_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-fira-sans',
  display: 'swap',
});

// 9. IBM PLEX SANS (corporate, modern)
export const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
});

// Note: Avenir will be handled as a system font through CSS and Tailwind config
