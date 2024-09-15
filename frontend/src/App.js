import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import AboutUs from './components/AboutUs';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Notifications, LocationOn } from '@mui/icons-material'; // Import the Location Icon
import pathGif from './assets/pathGif.gif'; // Use the GIF as the background
import logo from './assets/logo.png'; // Import the logo

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNavBar, setShowNavBar] = useState(false); // State to control navbar visibility
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);

    // Smooth scroll to the map section and display the navbar
    setTimeout(() => {
      if (mapRef.current) {
        const scrollOffset = mapRef.current.getBoundingClientRect().top + window.scrollY - 100; // Adjust the -100 to account for navbar and search bar height
        window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        setShowNavBar(true); // Show the navigation bar after scroll
      }
    }, 100);
  };

  const handleReturnToSearch = () => {
    navigate('/');
    navigate('/');
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          {/* Use the imported logo */}
          <img src={logo} alt="SafePath Logo" style={{ height: '40px', marginRight: '16px' }} />
          <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center' }}>
            SafePath
          </Typography>
          <Button color="inherit" component={Link} to="/about-us">
            About Us
          </Button>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <Button color="inherit" onClick={handleReturnToSearch}>
            Return to Search
          </Button>
        </Toolbar>
      </AppBar>

      {/* Define Routes */}
      <Routes>
        {/* Home Route */}
        <Route
          path="/"
          element={
            <>
              {/* Home Screen with Title, Search Bar, and Background GIF */}
              {!showMap && (
                <div
                  ref={searchRef}
                  style={{
                    padding: '80px',
                    textAlign: 'center',
                    marginTop: '50px',
                    backgroundImage: `url(${pathGif})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '100vh',
                  }}
                >
                  <Typography variant="h3" gutterBottom style={{ color: '#fff' }}>
                    SafePath
                  </Typography>
                  <SearchBar onSearch={handleSearch} value={location} />
                </div>
              )}

              {/* Map Component with Search Bar */}
              {showMap && (
                <div ref={mapRef} style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      padding: '10px',
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton>
                      <LocationOn />
                    </IconButton>
                    <SearchBar onSearch={handleSearch} value={location} />
                  </div>
                  <MapComponent location={location} />
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

function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default WrappedApp;
