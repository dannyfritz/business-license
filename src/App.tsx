import React from 'react';
import './App.css';
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";

const client = new ApolloClient({
  uri: process.env.REACT_APP_API_URL
});

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <Query
          query={gql`
            {
              activeBusinessLicenses(licenseType: "Short Term Rental") {
                bfn,
                entityName,
                establishmentAddress,
                latitude,
                longitude,
              }
            }
          `}
        >
          {({ loading, error, data }: any) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error :(</p>;

            return (
              <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              >
                <GoogleMap
                  mapContainerStyle={{ height: "100vh", width: "100vw" }}
                  zoom={12}
                  center={{
                    lat: 39.739346,
                    lng: -104.991040
                  }}
                >
                  {
                    data.activeBusinessLicenses
                      .filter((abl: any) => abl.latitude)
                      .map((abl: any) => (
                        <Marker
                          key={abl.bfn}
                          position={{
                            lat: abl.latitude,
                            lng: abl.longitude
                          }}
                        />
                      ))
                  }
                </GoogleMap>
              </LoadScript >
            )
          }}
        </Query>
      </div>
    </ApolloProvider>
  );
}

export default App;
