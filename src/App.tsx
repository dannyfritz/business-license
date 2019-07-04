import React from 'react';
import './App.css';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "react-apollo";
import { ShortTermRental } from "./Short-Term-Rental";

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <ShortTermRental />
      </div>
    </ApolloProvider>
  );
}

export default App;
