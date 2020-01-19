import React from 'react';
import './App.scss';
import ApolloClient from "apollo-boost";
import { ApolloProvider } from '@apollo/react-hooks';
import { EsriDataTable } from "./SitePlansTable";
import { Content } from './Content';
import {
  // EuiLink,
  // EuiHeader,
  // EuiHeaderSection,
  // EuiHeaderSectionItem,
  EuiPage,
  // EuiPageSideBar,
  EuiPageBody,
  // EuiTitle,
} from '@elastic/eui';

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_API_URL}/graphql`
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <EuiPage>
          {/* <EuiNavDrawer>
            <EuiPageSideBar>
              <EuiTitle size="l">
                <h1>Denver Data</h1>
              </EuiTitle>
              <EuiLink href="https://www.denvergov.org/opendata/">
                Denver Open Data Catalog
              </EuiLink>
            </EuiPageSideBar>
          </EuiNavDrawer> */}
          <EuiPageBody>
            <Content
              title="Denver Site Plans"
              source="https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-site-development-plans"
            >
              <EsriDataTable />
            </Content>
          </EuiPageBody>
        </EuiPage>
      </div>
    </ApolloProvider>
  );
}

export default App;
