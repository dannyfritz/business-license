
import React from 'react';
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";

export const ShortTermRental: React.FC = () => {
  return (
        <Query
          query={gql`
            {
              activeBusinessLicenses(licenseType: "Short Term Rental") {
                bfn,
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
  );
}