import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(location);
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '10px', display: 'flex', justifyContent: 'center' }}>
      <TextField
        label="Enter a location"
        variant="outlined"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{
          backgroundColor: '#ffffff', 
          marginRight: '10px',
          width: '300px',
        }}
        InputProps={{
          style: {
            color: '#000', 
          },
        }}
        InputLabelProps={{
          style: {
            color: '#000000', 
          },
        }}
      />
      <Button
        variant="contained"
        style={{
          backgroundColor: '#ffffff', 
          color: '#000', 
        }}
        type="submit"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
