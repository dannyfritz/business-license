import React from 'react';
import './App.scss';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from '@apollo/react-hooks';
import { SitePlansTable } from "./SitePlansTable";
import {
  EuiLink,
  EuiPage,
  EuiPageSideBar,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiPageContent,
  EuiTitle,
} from '@elastic/eui';

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}/graphql`
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <EuiPage>
          <EuiPageSideBar>
            <EuiTitle size="l">
              <h1>Denver Data</h1>
            </EuiTitle>
            <EuiLink href="https://www.denvergov.org/opendata/">
              Denver Open Data Catalog
            </EuiLink>
          </EuiPageSideBar>
          <EuiPageBody>
            <SitePlansTable />
          </EuiPageBody>
        </EuiPage>
      </div>
    </ApolloProvider>
  );
}

export default App;
