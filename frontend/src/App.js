import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';  // Import Router components
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import AboutUs from './components/AboutUs'; // Import the AboutUs component
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Notifications } from '@mui/icons-material';

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);

    // Smooth scroll to the map section
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleReturnToSearch = () => {
    if (searchRef.current) {
      searchRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Router> {/* Wrap the whole app inside Router */}
      <div className="App">
        {/* Navigation Bar */}
        <AppBar position="static">
          <Toolbar>
            {/* Logo */}
            <img
              src="path_to_logo_image" // Replace with your logo image path
              alt="Logo"
              style={{ marginRight: '16px', height: '40px' }}
            />
            {/* Spacer */}
            <div style={{ flexGrow: 1 }}></div>
            {/* About Us Button */}
            <Button color="inherit" component={Link} to="/about-us"> {/* Add Link to About Us */}
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

        {/* Define Routes */}
        <Routes>
          {/* Route for home */}
          <Route 
            path="/" 
            element={
              <>
                {/* Home Screen */}
                <div ref={searchRef} style={{ padding: '20px', textAlign: 'center' }}>
                  <Typography variant="h3" gutterBottom>
                    SafePath
                  </Typography>
                  <SearchBar onSearch={handleSearch} />
                </div>

                {/* Map Component */}
                {showMap && (
                  <div ref={mapRef}>
                    <MapComponent location={location} />
                  </div>
                )}
              </>
            } 
          />
          {/* Route for About Us */}
          <Route path="/about-us" element={<AboutUs />} /> {/* Render AboutUs component */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
