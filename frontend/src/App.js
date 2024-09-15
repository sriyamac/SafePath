import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'; 
import MapComponent from './components/MapComponent';
import SearchBar from './components/SearchBar';
import AboutUs from './components/AboutUs';
import { AppBar, Toolbar, Typography, Button, IconButton, Slide, Box } from '@mui/material';
import { Notifications, LocationOn } from '@mui/icons-material'; 
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme'; 

function App() {
  const [location, setLocation] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false); //navigation visible 
  const mapRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate(); //nav hook

  const handleSearch = (loc) => {
    setLocation(loc);
    setShowMap(true);

    //to show navbar during scroll
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

  //smooth scroll
  useEffect(() => {
    if (!showMap) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [showMap]);

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <Slide direction="down" in={showNavbar} mountOnEnter unmountOnExit>
          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6" style={{ flexGrow: 1 }}>
                SafePath
              </Typography>
              <Button color="inherit" component={Link} to="/about-us">
                About Us
              </Button>
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
              <Button color="inherit" onClick={handleReturnToSearch}>
                Back
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
                    <Typography variant="h3" gutterBottom>
                      SafeSpot
                    </Typography>
                    <SearchBar onSearch={handleSearch} />
                  </div>
                )}

                {/* Map Component */}
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
                      <LocationOn sx={{ marginRight: '8px', color: 'red' }} />

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
    </ThemeProvider> 
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
