import React, { useState, useRef } from 'react';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Notifications, LocationOn } from '@mui/icons-material'; 

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNavBar, setShowNavBar] = useState(false); 
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);


    setTimeout(() => {
      if (mapRef.current) {
        const scrollOffset = mapRef.current.getBoundingClientRect().top + window.scrollY - 100; 
        window.scrollTo({ top: scrollOffset, behavior: 'smooth' });
        setShowNavBar(true); 
      }
    }, 100);
  };

  return (
    <div className="App">
      {/* Conditionally render the Navigation Bar only after the map is shown */}
      {showNavBar && (
        <AppBar position="fixed" style={{ top: 0 }}>
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1, textAlign: 'center' }}>
              SafePath
            </Typography>
            <Button color="inherit">About Us</Button>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      {/* Home Screen with Title and Search Bar */}
      {!showMap && (
        <div ref={searchRef} style={{ padding: '80px', textAlign: 'center', marginTop: '50px' }}>
          <Typography variant="h3" gutterBottom>
            SafePath
          </Typography>
          <SearchBar onSearch={handleSearch} value={location} />
        </div>
      )}

      {/* Map Component with Search Bar */}
      {showMap && (
        <div ref={mapRef} style={{ marginTop: '70px' }}>
          {/* Keep the Search Bar visible on top of the Map */}
          <div style={{ padding: '10px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <IconButton>
              <LocationOn />
            </IconButton>
            <SearchBar onSearch={handleSearch} value={location} />
          </div>
          <MapComponent location={location} />
        </div>
      )}
    </div>
  );
}

export default App;
