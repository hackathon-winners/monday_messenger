import React, { useContext } from "react";
import {
  Carousel, // our UI Component to display the results
  SearchBar, // the search bar the user will type into
  SearchContext, // the context that wraps and connects our components
  SearchContextManager, // the context manager, includes the Context.Provider
} from "@giphy/react-components";
import styles from "./GiphySearch.module.css";

// define the components in a separate function so we can
// use the context hook. You could also use the render props pattern
const Components = ({ onSelect }) => {
  const { fetchGifs, searchKey } = useContext(SearchContext);
  return (
    <>
      <SearchBar />
      <div className={styles.images}>
        <Carousel
          fetchGifs={fetchGifs}
          gifHeight={150}
          gutter={4}
          key={searchKey}
          onGifClick={(gif, e) => {
            e.preventDefault();
            onSelect(gif);
          }}
        />
      </div>
    </>
  );
};

// the search experience consists of the manager and its child components that use SearchContext
export default function ({ onSelect }) {
  return (
    <SearchContextManager apiKey="dcfN9bUckav3L3wGbP1sIqInsyZHgLWN">
      <Components onSelect={onSelect} />
    </SearchContextManager>
  );
}
