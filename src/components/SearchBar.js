// src/components/SearchBar.js
import React, { useState } from 'react';
import axios from 'axios';
import { TextField, List, ListItem, ListItemText } from '@mui/material';

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(
          `https://api.twelvedata.com/symbol_search?symbol=${value}&apikey=${process.env.REACT_APP_TWELVE_DATA_API_KEY}`
        );
        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (symbol) => {
    setQuery('');
    setSuggestions([]);
    onSelect(symbol);
  };

  return (
    <div>
      <TextField
        fullWidth
        label="Search for a stock"
        variant="outlined"
        value={query}
        onChange={handleInputChange}
      />
      {suggestions.length > 0 && (
        <List>
          {suggestions.map((item) => (
            <ListItem
              button
              key={item.symbol}
              onClick={() => handleSelect(`${item.symbol}:${item.exchange}`)}
            >
              <ListItemText
                primary={`${item.instrument_name} (${item.symbol})`}
                secondary={item.exchange}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
};

export default SearchBar;
