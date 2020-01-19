import React, {
  useCallback,
  useState,
} from 'react';
import moment from "moment";
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import { FilterControl, FilterInput } from "./FilterControl";
import {
  EuiButtonEmpty,
  EuiDataGrid,
  EuiLoadingContent,
  EuiLink,
  EuiCallOut,
  EuiDataGridSorting,
  EuiPopover,
  EuiToolTip,
} from '@elastic/eui';
import { Content } from './Content';

const baseColumn = {
  isExpandable: false,
  isHidden: false,
}

const columns = [
  {
    ...baseColumn,
    id: "PLAN_NAME",
  },
  {
    ...baseColumn,
    id: "ADDRESS_LINE1",
    initialWidth: 300,
  },
  {
    ...baseColumn,
    id: "PROPOSED_USE_1",
  },
  {
    ...baseColumn,
    id: "RECORD_TYPE",
    isHidden: true,
  },
  {
    ...baseColumn,
    id: "STATUS",
    initialWidth: 150,
  },
  {
    ...baseColumn,
    id: "STATUS_DATE",
    initialWidth: 150,
  },
  {
    ...baseColumn,
    id: "RECEPTION_DATE",
    initialWidth: 150,
  },
  {
    ...baseColumn,
    id: "PARKING_SPACES",
    initialWidth: 150,
    isHidden: true,
  },
  {
    ...baseColumn,
    id: "PROP_HEIGHT",
    initialWidth: 150,
    isHidden: true,
  },
  {
    ...baseColumn,
    id: "PROP_STORIES",
    initialWidth: 150,
    isHidden: true,
  },
  {
    ...baseColumn,
    id: "GROSS_FLOOR_AREA",
    initialWidth: 150,
    isHidden: true,
  },
  {
    ...baseColumn,
    id: "DOCUMENT_1",
    initialWidth: 150,
    isHidden: true,
  }
];

const SitePlanCell = ({ loading, data, columnId, setCellProps }) => {
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
    case "STATUS_DATE":
      const m = moment(d);
      if (!m.isValid()) {
        return "";
      }
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

  const [filterInput, setFilterInput] =
    useState<FilterInput>({
      all: [],
      groups: [],
    });
  const onSetFilterInput = useCallback(
    (filterInput: FilterInput) => setFilterInput(filterInput),
    [setFilterInput],
  );
  const numberOfFiltersApplied = filterInput.all.length + filterInput.groups.reduce((sum, g) => sum + g.length, 0);

  const[isFilterOpen, setIsFilterOpen] =
    useState(false);
  const onToggleIsFilterOpen = useCallback(
    () => setIsFilterOpen(!isFilterOpen),
    [setIsFilterOpen, isFilterOpen],
  );

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.filter(({ isHidden }) => !isHidden).map(({ id }) => id)
  );

  // const SITE_PLAN_SCHEMA_QUERY = gql`
  //   query {
  //     SitePlanSchema {
  //       column
  //       type
  //     }
  //   }
  // `;
  // const { loading: schemaLoading, error: schemaError, data: schema } = useQuery(SITE_PLAN_SCHEMA_QUERY);

  const SITE_PLAN_QUERY = gql`
    query Fetch ($count: Int, $offset: Int, $sortBy: [SitePlanSort], $filterBy: [SitePlanFilterInput]) {
      SitePlanCount
      SitePlans (count: $count, offset: $offset, sortBy: $sortBy, filterBy: $filterBy) {
        PLAN_NAME
        RECEPTION_DATE
        ADDRESS_LINE1
        PARKING_SPACES
        STATUS
        RECORD_TYPE
        STATUS_DATE
        PROPOSED_USE_1
        PROP_HEIGHT
        PROP_STORIES
        GROSS_FLOOR_AREA
        DOCUMENT_1
      }
    }
  `;
  const { loading: rowsLoading, error: rowsError, data: rowsData } = useQuery(SITE_PLAN_QUERY, {
    variables: {
      count: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: sortingColumns.map(sort => ({
        column: sort.id,
        direction: sort.direction.toUpperCase(),
      })),
      filterBy: filterInput,
    }
  });

  const renderCellValue = ({ rowIndex, columnId, setCellProps }) => {
    if (rowsLoading) {
      return <EuiLoadingContent lines={1} />
    }
    const rowData = rowsData.SitePlans[rowIndex - pagination.pageSize * pagination.pageIndex]
    return <SitePlanCell loading={rowsLoading} data={rowData} columnId={columnId} setCellProps={setCellProps} />;
  };

  if (rowsError) {
    return (
      <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
        <p>{rowsError.message}</p>
      </EuiCallOut>
    )
  }

  const filterButton = (
    <EuiButtonEmpty
      iconType="filter"
      onClick={onToggleIsFilterOpen}
      color="text"
      size="xs"
      className={`${numberOfFiltersApplied > 0 ? "euiDataGrid__controlBtn--active" : ""}`}
    >
      {
        numberOfFiltersApplied === 0
          ? "Filters"
          : `${numberOfFiltersApplied} filters applied`
      }
    </EuiButtonEmpty>
  )

  return (
    <Content
      title="Denver Site Plans"
      source="https://www.denvergov.org/opendata/dataset/city-and-county-of-denver-site-development-plans"
    >
      <EuiDataGrid
        aria-label="Site Plans Data Table"
        columns={columns}
        columnVisibility={{ visibleColumns, setVisibleColumns }}
        rowCount={rowsData ? rowsData.SitePlanCount : pagination.pageSize}
        renderCellValue={renderCellValue}
        toolbarVisibility={{
          showFullScreenSelector: false,
          additionalControls: (
            <>
              <EuiPopover
                anchorPosition="downLeft"
                button={filterButton}
                ownFocus
                isOpen={isFilterOpen}
                closePopover={onToggleIsFilterOpen}
                panelClassName="euiDataGridColumnSortingPopover"
                panelPaddingSize="s"
              >
                <FilterControl
                  filterInput={filterInput}
                  onSetFilterInput={onSetFilterInput}
                />
              </EuiPopover>
            </>
          )
        }}
        gridStyle={{
          // stripes: true,
          header: "shade",
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
