import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import AboutUs from './components/AboutUs';
import { AppBar, Toolbar, Typography, Button, IconButton, Slide, Box } from '@mui/material';
import { Notifications } from '@mui/icons-material'; 
import './App.css'; 

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);

    setTimeout(() => {
      setShowNavbar(true);
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleReturnToSearch = () => {
    setShowNavbar(false);
    setShowMap(false);
    navigate('/');
  };

  useEffect(() => {
    if (!showMap) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showMap]);

  return (
    <div className="App">
      <div className="animated-background"></div> 

      <Slide direction="down" in={showNavbar} mountOnEnter unmountOnExit>
        <AppBar position="fixed">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              SafeSpot
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
      </Slide>

      <Routes>
        <Route
          path="/"
          element={
            <>
              {!showMap && (
                <div ref={searchRef} style={{ padding: '20px', textAlign: 'center', marginTop: '100px' }}>
                  {/* Make the SafeSpot text white */}
                  <Typography variant="h3" gutterBottom style={{ color: '#ffffff' }}>
                    SafeSpot
                  </Typography>
                  <SearchBar onSearch={handleSearch} />
                </div>
              )}

              {showMap && (
                <div ref={mapRef} style={{ marginTop: '64px' }}>
                  <MapComponent location={location} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '70px',
                      left: '200px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
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
