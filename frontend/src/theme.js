import { createTheme } from '@mui/material/styles';

// Define your custom colors
const colors = {
  primary: '#46566d',  // Light blue
  secondary: '#ffd460',  // Yellow accent
  background: '#f0f8ff', // Light blueish background
  text: '#ffffff', // White text for contrast
};

// Create the theme using the custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      contrastText: '#ffffff', // White text for contrast
    },
    secondary: {
      main: colors.secondary,
      contrastText: '#fffff', // White text for yellow buttons and elements
    },
    background: {
      default: colors.background, // Set default background color
    },
    text: {
      primary: colors.text, // White text color globally
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '3rem',
      fontWeight: 700,  // Bold
      color: colors.text, // White text
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,  // Semi-bold
      color: colors.text, // White text
    },
    body1: {
      fontSize: '1rem',
      color: colors.text,  // White body text
    },
    button: {
      fontSize: '1.2rem',
      textTransform: 'none',  // Disable uppercase button text
      color: colors.text, // Ensure button text is white
    },
  },
});

export default theme;
