import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import MUIDataTable from "mui-datatables";

const COLUMNS = [
  {
    name: "OBJECTID",
    label: "Object ID",
    options: {
      sort: true,
      filter: true,
    }
  },
  {
    name: "ADDRESS_LINE1",
    label: "Address",
    options: {
      sort: true,
      filter: true,
    }
  },
  {
    name: "PROP_STORIES",
    label: "Number of Stories",
    options: {
      sort: true,
      filter: true,
    }
  },
  {
    name: "RECEPTION_DATE",
    label: "Reception Date",
    options: {
      sort: true,
      filter: true,
    }
  },
];


const SITE_PLANS = gql`
  query FETCH($offset: Int, $count: Int, $sortBy: [SitePlan_column]){
    SitePlans(offset: $offset, count: $count, sortBy: $sortBy) {
      OBJECTID
      ADDRESS_LINE1
      PROP_STORIES
      RECEPTION_DATE
    }
    SitePlanCount
  }
`;

export function SitePlansTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentSort, setCurrentSort] = useState("RECEPTION_DATE_ASC");
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
    filterType: 'textField',
    serverSide: true,
    selectableRows: 'none',
    resizableColumns: true,
    responsive: 'scrollFullHeight',
    fixedHeaderOptions: {
      xAxis: true,
      yAxis: true,
    },
    rowsPerPage: pageSize,
    page: currentPage,
    count: data.SitePlanCount,
    onColumnSortChange: (column, direction) => {
      const dir = direction === "ascending" ? "ASC" : "DESC";
      setCurrentSort(`${column}_${dir}`);
    },
    onChangePage: (currentPage) => setCurrentPage(currentPage),
    onChangeRowsPerPage: (numberOfRows) => setPageSize(numberOfRows),
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
