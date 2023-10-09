import React from "react";

const SearchResults = ({ query, results }) => {
  return (
    <div>
      <h3>Search Results for "{query}":</h3>
      <ul>
        {results.map((result) => (
          <li key={result.id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
