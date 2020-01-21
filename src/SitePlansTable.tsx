import React, {
  useCallback,
  useState,
  useContext,
  FunctionComponent
} from 'react';
import moment from "moment";
import { useQuery } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import { FilterControl, FilterInput } from "./FilterControl";
import {
  EuiButtonEmpty,
  EuiDataGrid,
  EuiLoadingChart,
  EuiLoadingContent,
  EuiLink,
  EuiCallOut,
  EuiDataGridSorting,
  EuiPopover,
  EuiToolTip,
} from '@elastic/eui';

const baseColumn = {
  isExpandable: false,
  isHidden: false,
}

export enum SchemaKind {
  Int = "Int",
  Float = "Float",
  Date = "Date",
  String = "String",
};

export interface Schema {
  column: string,
  type: SchemaKind,
}

interface Pagination {
  pageIndex: number,
  pageSize: number,
};

interface IEsriDataTableContext {
  state: {
    schema: Array<Schema>;
    visibleColumns: Array<any>
    pagination: Pagination,
    sorting: EuiDataGridSorting["columns"],
    filters: FilterInput,
  },
  actions: {
    setVisibleColumns: any,
    setPagination: (pagination: Pagination) => void,
    onChangeItemsPerPage: any,
    onChangePage: any,
    onSort: any,
    setFilters: any,
    onSetFilters: any,
    onAddGroup: any,
    onRemoveGroup: any,
    onAddAllFilter: any,
    onRemoveAllFilter: any,
    onAddFilter: any,
    onRemoveFilter: any,
  };
}

export const EsriDataTableContext = React.createContext<IEsriDataTableContext>(null as IEsriDataTableContext);

export const EsriDataTable = () => {
  const SITE_PLAN_SCHEMA_QUERY = gql`
    query {
      SitePlansSchema {
        column
        type
      }
    }
  `;
  const { loading: schemaLoading, error: schemaError, data } = useQuery(SITE_PLAN_SCHEMA_QUERY);

  const [pagination, setPagination] = useState<Pagination>({ pageIndex: 0, pageSize: 10 });
  const onChangeItemsPerPage = useCallback(
    pageSize => setPagination(pagination => ({ ...pagination, pageSize })),
    [setPagination]
  );
  const onChangePage = useCallback(
    pageIndex => setPagination(pagination => ({ ...pagination, pageIndex })),
    [setPagination]
  );

  const [sorting, setSorting] =
    useState<EuiDataGridSorting["columns"]>([{ id: "RECEPTION_DATE", direction: "desc" }]);
  const onSort = useCallback(
    sortingColumns => setSorting(sortingColumns),
    [setSorting]
  );

  const [filters, setFilters] =
    useState<FilterInput>({
      all: [],
      groups: [],
    });
  const onSetFilters = useCallback(
    (filters: FilterInput) => setFilters(filters),
    [setFilters],
  );

  const [visibleColumns, setVisibleColumns] = useState(() =>
    columns.filter(({ isHidden }) => !isHidden).map(({ id }) => id)
  );
  const onAddGroup = useCallback(
    () => onSetFilters({
      ...filters,
      groups: [...filters.groups, []],
    }),
    [filters, onSetFilters],
  )
  const onRemoveGroup = useCallback(
    (index) => onSetFilters({
      ...filters,
      groups: filters.groups.filter((_, i) => i !== index)
    }),
    [filters, onSetFilters],
  )
  const onAddAllFilter = useCallback(
    () => onSetFilters({
      ...filters,
      all: [...filters.all, {}],
    }),
    [filters, onSetFilters],
  )
  const onRemoveAllFilter = useCallback(
    (index) => onSetFilters({
      ...filters,
      all: filters.all.filter((_, i) => i !== index),
    }),
    [filters, onSetFilters],
  )
  const onAddFilter = useCallback(
    (index) => {
      const group = [...filters.groups[index], {}];
      const groups = [...filters.groups];
      groups[index] = group;
      onSetFilters({
        ...filters,
        groups
      });
    },
    [filters, onSetFilters],
  )
  const onRemoveFilter = useCallback(
    (groupIndex, index) => {
      const group = filters.groups[groupIndex].filter((_, i) => i !== index);
      const groups = [...filters.groups];
      groups[groupIndex] = group;
      onSetFilters({
        ...filters,
        groups
      });
    },
    [filters, onSetFilters],
  )

  if (schemaError) {
    return (
      <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
        <p>{schemaError.message}</p>
      </EuiCallOut>
    )
  } else if (schemaLoading) {
    return (
      <EuiLoadingChart size="xl" />
    );
  }

  const context = {
    state: {
      schema: data.SitePlansSchema,
      visibleColumns,
      pagination,
      sorting,
      filters,
    },
    actions: {
      setVisibleColumns,
      setPagination,
      onChangeItemsPerPage,
      onChangePage,
      onSort,
      setFilters,
      onSetFilters,
      onAddGroup,
      onRemoveGroup,
      onAddAllFilter,
      onRemoveAllFilter,
      onAddFilter,
      onRemoveFilter,
    },
  };
  return (
    <EsriDataTableContext.Provider value={context}>
      <DataTable />
    </EsriDataTableContext.Provider>
  );
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

const DataTableCell = ({ loading, data, columnId, setCellProps }) => {
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

export interface DataTableProps {};

export const DataTable: FunctionComponent<DataTableProps> = () => {
  const {
    state: {
      schema, pagination, sorting, filters, visibleColumns
    },
    actions: {
      setVisibleColumns,
      onSort,
      onChangeItemsPerPage,
      onChangePage,
    }
  } = useContext(EsriDataTableContext);

  const SITE_PLAN_QUERY = gql`
    query Fetch ($count: Int, $offset: Int, $sortBy: [SitePlanSort], $filterBy: [SitePlanFilterInput]) {
      SitePlanCount (filterBy: $filterBy)
      SitePlans (count: $count, offset: $offset, sortBy: $sortBy, filterBy: $filterBy) {
        ${schema.map(s => `${s.column}\n`)}
      }
    }
  `;
  const { loading: rowsLoading, error: rowsError, data: rowsData } = useQuery(SITE_PLAN_QUERY, {
    variables: {
      count: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      sortBy: sorting.map(sort => ({
        column: sort.id,
        direction: sort.direction.toUpperCase(),
      })),
      filterBy: filters,
    }
  });

  const[isFilterOpen, setIsFilterOpen] =
    useState(false);
  const onToggleIsFilterOpen = useCallback(
    () => setIsFilterOpen(!isFilterOpen),
    [setIsFilterOpen, isFilterOpen],
  );

  const renderCellValue = ({ rowIndex, columnId, setCellProps }) => {
    if (rowsLoading) {
      return <EuiLoadingContent lines={1} />
    }
    const rowData = rowsData.SitePlans[rowIndex - pagination.pageSize * pagination.pageIndex]
    return <DataTableCell loading={rowsLoading} data={rowData} columnId={columnId} setCellProps={setCellProps} />;
  };

  if (rowsError) {
    return (
      <EuiCallOut title="Sorry, there was an error" color="danger" iconType="alert">
        <p>{rowsError.message}</p>
      </EuiCallOut>
    )
  }

  const numberOfFiltersApplied = filters.all.length + filters.groups.reduce((sum, g) => sum + g.length, 0);

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
                <FilterControl />
              </EuiPopover>
            </>
          )
        }}
        gridStyle={{
          header: "shade",
        }}
        sorting={{
          columns: sorting,
          onSort
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
