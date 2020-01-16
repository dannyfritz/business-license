import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import moment from "moment";
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import {
  EuiDataGrid,
  EuiLoadingContent,
  EuiLink,
  EuiCallOut,
  EuiDataGridSorting,
  EuiToolTip,
} from '@elastic/eui';
import { Content } from './Content';

const SITE_PLAN_QUERY = gql`
  query Fetch ($count: Int, $offset: Int, $sortBy: [SitePlan_column]) {
    SitePlanCount
    SitePlans (count: $count, offset: $offset, sortBy: $sortBy) {
      PLAN_NAME
      RECEPTION_DATE
      ADDRESS_LINE1
    }
  }
`;

const columns = [
  {
    id: "PLAN_NAME",
    isExpandable: false,

  },
  {
    id: "RECEPTION_DATE",
    isExpandable: false,
  },
  {
    id: "ADDRESS_LINE1",
    isExpandable: false,
  },
];

const SitePlanCell = ({ loading, data, columnId, setCellProps }) => {
  // useEffect(() => {
  //   if (columnId === 'RECEPTION_DATE') {
  //     const numeric = parseFloat(
  //       data[columnId].match(/\d+\.\d+/)[0]
  //     );
  //     setCellProps({
  //       style: {
  //         backgroundColor: `rgba(0, 255, 0, ${numeric * 0.02})`,
  //       },
  //     });
  //   }
  // }, [data, columnId, setCellProps]);
  if (loading) {
    return <EuiLoadingContent lines={1} />
  }
  const d = data[columnId];
  switch (columnId) {
    case "ADDRESS_LINE1":
      return (
        <EuiLink color="subdued" href={`https://www.google.com/maps/search/${d}+Denver+CO/`}>
          {data[columnId]}
        </EuiLink>
      );
    case "RECEPTION_DATE":
      const m = moment(d);
      return (
        <EuiToolTip content={m.fromNow()}>
          <p>{ m.format("YYYY-MM-DD") }</p>
        </EuiToolTip>
      );
    default:
      return data[columnId];
  }
}

export const SitePlansTable = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const onChangeItemsPerPage = useCallback(
    pageSize => setPagination(pagination => ({ ...pagination, pageSize })),
    [setPagination]
  );
  const onChangePage = useCallback(
    pageIndex => setPagination(pagination => ({ ...pagination, pageIndex })),
    [setPagination]
  );

  const [sortingColumns, setSortingColumns] =
    useState<EuiDataGridSorting["columns"]>([{ id: "RECEPTION_DATE", direction: "desc" }]);
  const onSort = useCallback(
    sortingColumns => setSortingColumns(sortingColumns),
    [setSortingColumns]
  );

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map(({ id }) => id)
  );

  const { loading, error, data } = useQuery(SITE_PLAN_QUERY, {
    variables: {
      count: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: sortingColumns.map(sort => `${sort.id}_${sort.direction.toUpperCase()}`),
    }
  });

  const renderCellValue = ({ rowIndex, columnId, setCellProps }) => {
    const rowData = data.SitePlans[rowIndex - pagination.pageSize * pagination.pageIndex]
    return <SitePlanCell loading={loading} data={rowData} columnId={columnId} setCellProps={setCellProps} />;
  };

  if (error) {
    return (
      <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
        <p>{error}</p>
      </EuiCallOut>
    )
  }

  return (
    <Content
      title="Denver Site Plans"
      source="https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-site-development-plans"
    >
      <EuiDataGrid
        aria-label="Site Plans Data Table"
        columns={columns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={data ? data.SitePlanCount : 0}
        renderCellValue={renderCellValue}
        toolbarVisibility={{
          showFullScreenSelector: false,
        }}
        gridStyle={{
          stripes: true,
          header: "shade",
          border: "horizontal",
        }}
        sorting={{
          columns: sortingColumns,
          onSort
        }}
        pagination={{
          ...pagination,
          pageSizeOptions: [10, 25, 50, 100],
          onChangeItemsPerPage: onChangeItemsPerPage,
          onChangePage: onChangePage,
        }}
      />
    </Content>
  );
};
