import React from 'react';
import './App.scss';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from '@apollo/react-hooks';
import { SitePlansTable } from "./SitePlansTable";

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}/graphql`
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <SitePlansTable />
      </div>
    </ApolloProvider>
  );
}

export default App;
