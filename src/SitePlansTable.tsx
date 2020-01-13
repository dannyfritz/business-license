import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import MUIDataTable from "mui-datatables";
import { format, parse } from "date-fns";

const formatDate = (value) => value ? format(parse(value, "T", new Date()), "MMM d, yyyy") : "";
const formatDocument = (value) => value ? (<a href={`https://www.denvergov.org/media/gis/WebDocs/CPD/SDP_Maps/${value}`} target="_blank">Open</a>) : "";
const formatAddress = (value) => value ? (<a href={`https://www.google.com/maps/place/${value}+Denver+CO`} target="_blank" rel="noopener noreferrer">{value}</a>) : "";

const createColumn = (name, label, display, type = 'default') => ({
    name,
    label,
    options: {
      display,
      sort: true,
      filter: true,
      customBodyRender: type === "date" ? formatDate :
                        type === "document" ? formatDocument :
                        type === "address" ? formatAddress :
                        undefined,
    },
  })

const COLUMNS = [
  createColumn("RECORD_ID", "Record Id", false),
  createColumn("RECORD_TYPE", "Record Type", false),
  createColumn("STATUS", "Status", true),
  createColumn("STATUS_DATE", "Status Date", false, "date"),
  createColumn("PLAN_NAME", "Plan Name", true),
  createColumn("DESCRIPTION", "Description", false),
  createColumn("LOG_NUM", "Log Number", false),
  createColumn("RECEPTION_NUM", "Reception Number", false),
  createColumn("RECEPTION_DATE", "Reception Date", true, "date"),
  createColumn("OTHER_REC_NUMS", "Other Reception Numbers", false),
  createColumn("ADDRESS_LINE1", "Address Line", true, "address"),
  createColumn("STREET_NUM", "Street #", false),
  createColumn("STREET_DIR", "Street Direction", false),
  createColumn("STREET_NAME", "Street Name", false),
  createColumn("STREET_TYPE", "Street Type", false),
  createColumn("UNIT_NUM", "Unit Number", false),
  createColumn("PROPOSED_USE_1", "Proposed Use", true),
  createColumn("PROPOSED_USE_2", "Proposed Use 2", false),
  createColumn("PROPOSED_USE_3", "Proposed Use 3", false),
  createColumn("PROPOSED_USE_4", "Proposed Use 4", false),
  createColumn("ACCESSORY_USE_1", "Accessory Use", false),
  createColumn("ACCESSORY_USE_2", "Accessory Use 2", false),
  createColumn("PARCEL_PRIMARY", "Parcel Primary", false),
  createColumn("PARCEL_SIZE", "Parcel Size", false),
  createColumn("PROP_BLDG_FORM_1", "Building Form", false),
  createColumn("PROP_BLDG_FORM_2", "Building Form 2", false),
  createColumn("PARKING_SPACES", "Parking Spaces", true),
  createColumn("PROP_DWELLING_UNITS", "Dwelling Units", true),
  createColumn("PROP_STRUCTURES", "Structures", false),
  createColumn("PROP_HEIGHT", "Height", false),
  createColumn("PROP_STORIES", "Stories", false),
  createColumn("GROSS_FLOOR_AREA", "Gross Floor Area", true),
  createColumn("DOCUMENT_1", "PDF", true, "document"),
  createColumn("DOCUMENT_2", "PDF 2", true, "document"),
  createColumn("DOCUMENT_3", "PDF 3", true, "document"),
  createColumn("DOCUMENT_4", "PDF 4", true, "document"),
  createColumn("RELATED_RECORDS", "Related Records", false),
  createColumn("NOTES", "Notes", false),
];

const SITE_PLANS = gql`
  query FETCH($offset: Int, $count: Int, $sortBy: [SitePlan_column]){
    SitePlans(offset: $offset, count: $count, sortBy: $sortBy) {
      RECORD_ID
      RECORD_TYPE
      STATUS
      STATUS_DATE
      PLAN_NAME
      DESCRIPTION
      LOG_NUM
      RECEPTION_NUM
      RECEPTION_DATE
      OTHER_REC_NUMS
      ADDRESS_LINE1
      STREET_NUM
      STREET_DIR
      STREET_NAME
      STREET_TYPE
      UNIT_NUM
      PROPOSED_USE_1
      PROPOSED_USE_2
      PROPOSED_USE_3
      PROPOSED_USE_4
      ACCESSORY_USE_1
      ACCESSORY_USE_2
      PARCEL_PRIMARY
      PARCEL_SIZE
      PROP_BLDG_FORM_1
      PROP_BLDG_FORM_2
      PARKING_SPACES
      PROP_DWELLING_UNITS
      PROP_STRUCTURES
      PROP_HEIGHT
      PROP_STORIES
      GROSS_FLOOR_AREA
      DOCUMENT_1
      DOCUMENT_2
      DOCUMENT_3
      DOCUMENT_4
      RELATED_RECORDS
      NOTES
    }
    SitePlanCount
  }
`;

export function SitePlansTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [currentSort, setCurrentSort] = useState("RECEPTION_DATE_DESC");
  const { loading, error, data } = useQuery(
    SITE_PLANS,
    {
      variables: {
        offset: currentPage * pageSize,
        count: pageSize,
        sortBy: [currentSort],
      }
    }
  );

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :( {error.message}</p>

  const OPTIONS = {
    filter: false,
    search: false,
    download: false,
    print: false,
    filterType: 'textField',
    serverSide: true,
    selectableRows: 'none',
    resizableColumns: false,
    responsive: 'scrollFullHeight',
    fixedHeaderOptions: {
      xAxis: true,
      yAxis: true,
    },
    rowsPerPageOptions: [10, 25, 50, 100],
    rowsPerPage: pageSize,
    page: currentPage,
    count: data.SitePlanCount,
    onColumnSortChange: (column, direction) => {
      const dir = direction === "ascending" ? "ASC" : "DESC";
      setCurrentSort(`${column}_${dir}`);
    },
    onChangePage: (currentPage) => setCurrentPage(currentPage),
    onChangeRowsPerPage: (numberOfRows) => setPageSize(numberOfRows),
    onFilterChange(changedColumn, filterList, type) {
      console.log(changedColumn, filterList, type)
    }
  }

  return (
    <MUIDataTable
      title={"Denver Site Plans"}
      columns={COLUMNS}
      options={OPTIONS}
      data={data.SitePlans}
    />
  )
}
