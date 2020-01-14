import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import {
  EuiDataGrid,
  EuiLoadingContent,
  EuiCallOut,
} from '@elastic/eui';

const SITE_PLAN_QUERY = gql`
  query Fetch ($count: Int, $offset: Int) {
    SitePlanCount
    SitePlans (count: $count, offset: $offset) {
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
  useEffect(() => {
    if (columnId === 'amount') {
      const numeric = parseFloat(
        data[columnId].match(/\d+\.\d+/)[0]
      );
      setCellProps({
        style: {
          backgroundColor: `rgba(0, 255, 0, ${numeric * 0.0002})`,
        },
      });
    }
  }, [data, columnId, setCellProps]);
  if (loading) {
    return <EuiLoadingContent lines={1} />
  }
  return data[columnId];
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

  const [sortingColumns, setSortingColumns] = useState([]);
  const onSort = useCallback(
    sortingColumns => {
      setSortingColumns(sortingColumns);
    },
    [setSortingColumns]
  );

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.map(({ id }) => id)
  );

  const { loading, error, data } = useQuery(SITE_PLAN_QUERY, {
    variables: {
      count: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize
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
    <EuiDataGrid
      aria-label="Site Plans Data Table"
      columns={columns}
      columnVisibility={{ visibleColumns, setVisibleColumns }}
      rowCount={data ? data.SitePlanCount : 0}
      renderCellValue={renderCellValue}
      sorting={{ columns: sortingColumns, onSort }}
      toolbarVisibility={{
        showFullScreenSelector: false,
      }}
      gridStyle={{
        stripes: true,
        header: "shade",
        border: "horizontal",
      }}
      pagination={{
        ...pagination,
        pageSizeOptions: [10, 25, 50, 100],
        onChangeItemsPerPage: onChangeItemsPerPage,
        onChangePage: onChangePage,
      }}
    />
  );
};
