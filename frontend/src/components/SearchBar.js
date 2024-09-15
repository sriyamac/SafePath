import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(location);
    };

    return (
        <form onSubmit={handleSubmit} style={{ margin: '10px' }}>
            <input
                type="text"
                placeholder="Enter a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    );
};

export default SearchBar;
