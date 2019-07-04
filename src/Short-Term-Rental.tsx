
import React, { useState } from 'react';
import { LoadScript, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { gql } from "apollo-boost";
import { Query } from "react-apollo";
import { DateTime } from "luxon";

export const ShortTermRental: React.FC = () => {
    const [selectedRental, setSelectedRental]: [{ bfn: string, latitude: number, longitude: number } | null, any]
        = useState(null);
    const [mapOptions] = useState({
        zoom: 12,
        center: {
            lat: 39.739346,
            lng: -104.991040
        },
    });
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
                            {...mapOptions}
                        >
                            {
                                data.activeBusinessLicenses
                                    .filter((abl: any) => abl.latitude)
                                    .map((abl: any) => (
                                        <Marker
                                            onClick={() => setSelectedRental(abl)}
                                            key={abl.bfn}
                                            position={{
                                                lat: abl.latitude,
                                                lng: abl.longitude
                                            }}
                                        />
                                    ))
                            }
                            {
                                selectedRental &&
                                <Query
                                    query={gql`
                                    {
                                        activeBusinessLicense(bfn: "${selectedRental!.bfn}") {
                                            bfn,
                                            latitude,
                                            longitude,
                                            licenseStatus,
                                            expirationDate,
                                            entityName,
                                            establishmentAddress,
                                        }
                                    }
                                `}
                                >
                                    {({ loading, error, data, data: { activeBusinessLicense: abl } }: any) => {
                                        return (
                                            <InfoWindow
                                                position={{
                                                    lat: selectedRental!.latitude,
                                                    lng: selectedRental!.longitude,
                                                }}
                                                onCloseClick={() => setSelectedRental(null)}
                                            >
                                                <div>
                                                    {
                                                        loading &&
                                                        <React.Fragment>
                                                            <div>{selectedRental!.bfn}</div>
                                                            <div>Loading...</div>
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        error &&
                                                        <React.Fragment>
                                                            <div>{selectedRental!.bfn}</div>
                                                            <div>Error :(</div>
                                                        </React.Fragment>
                                                    }
                                                    {
                                                        abl &&
                                                        <React.Fragment>
                                                            <div>Address: {abl.establishmentAddress}</div>
                                                            <div>Entity Name: {abl.entityName}</div>
                                                            <div>{abl.bfn}</div>
                                                            <div>Status: {abl.licenseStatus}</div>
                                                            <div>Expiration: {DateTime.fromISO(abl.expirationDate).toLocaleString(DateTime.DATE_MED)}</div>
                                                        </React.Fragment>
                                                    }
                                                </div>
                                            </InfoWindow>
                                        )
                                    }}
                                </Query>
                            }
                        </GoogleMap>
                    </LoadScript >
                )
            }}
        </Query>
    );
}