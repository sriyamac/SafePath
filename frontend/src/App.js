import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import AboutUs from './components/AboutUs';
import { AppBar, Toolbar, Typography, Button, IconButton, Slide, Box } from '@mui/material';
import { Notifications } from '@mui/icons-material';

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false); // Navigation bar visibility
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);

    // Trigger showing the navbar during scroll
    setTimeout(() => {
      setShowNavbar(true);
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleReturnToSearch = () => {
    setShowNavbar(false); // Hide the navbar when returning to search
    setShowMap(false); // Hide the map and return to the initial state
    navigate('/'); // Navigate back to the home route
  };

  // Add a smooth scroll to the top when returning to search
  useEffect(() => {
    if (!showMap) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showMap]);

  return (
    <div className="App">
      {/* Conditional Navigation Bar */}
      <Slide direction="down" in={showNavbar} mountOnEnter unmountOnExit>
        <AppBar position="fixed">
          <Toolbar>
            {/* Title integrated into the navigation bar */}
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              SafeSpot
            </Typography>
            {/* About Us Button linked to the About Us route */}
            <Button color="inherit" component={Link} to="/about-us">
              About Us
            </Button>
            {/* Notification Icon */}
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            {/* Return to Search Button */}
            <Button color="inherit" onClick={handleReturnToSearch}>
              Return to Search
            </Button>
          </Toolbar>
        </AppBar>
      </Slide>

      <Routes>
        {/* Home Route (Main App) */}
        <Route
          path="/"
          element={
            <>
              {!showMap && (
                <div ref={searchRef} style={{ padding: '20px', textAlign: 'center', marginTop: '100px' }}>
                  <Typography variant="h3" gutterBottom>
                    SafeSpot
                  </Typography>
                  <SearchBar onSearch={handleSearch} />
                </div>
              )}

              {/* Map Component */}
              {showMap && (
                <div ref={mapRef} style={{ marginTop: '64px' }}> {/* Add marginTop to avoid overlap with fixed navbar */}
                  <MapComponent location={location} />

                  {/* Location display in the top-left corner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '125px', // Adjust to move it slightly down from the top edge
                      left: '16px', // Adjust to move it slightly right from the left edge
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 10, // Ensure it remains above other elements
                    }}
                  >
                    <Typography variant="h5" color="primary">
                      {location}
                    </Typography>
                  </Box>
                </div>
              )}
            </>
          }
        />

        {/* About Us Route */}
        <Route path="/about-us" element={<AboutUs />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
