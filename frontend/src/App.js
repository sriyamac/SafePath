import React, { useState, useRef } from 'react';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
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
          <Button color="inherit">About Us</Button>
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

      {/* Home Screen */}
      <div ref={searchRef} style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          SafeSpot
        </Typography>
        <SearchBar onSearch={handleSearch} />
      </div>

      {showMap && (
        <div ref={mapRef}>
          <MapComponent location={location} />
        </div>
      )}
    </div>
  );
}

export default App;
