import React, { FunctionComponent, useCallback, useContext } from "react";
import {
  EuiButtonIcon,
  EuiButtonEmpty,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui';
import { SchemaKind, EsriDataTableContext } from "./SitePlansTable";

export interface FilterInput {
  all: FilterGroup,
  groups: Array<FilterGroup>,
}

export enum CriteriaType {
  NotNull,
  IsNull,
  EqualTo,
  LessThanOrEqual,
  GreaterThanOrEqual,
  Between,
  Contains,
};

export type FilterGroup = Array<Filter>;

export interface Filter {
  column?: string,
  kind?: SchemaKind,
  type?: CriteriaType
  ints?: [Number]
  floats?: [Number]
  dates?: [Number]
  strings?: [String]
};

interface FilterListProps {
  filter: Filter,
  onRemoveFilter: () => void,
};

const FilterListItem: FunctionComponent<FilterListProps> = ({
  filter, onRemoveFilter
}) => {
  const {
    state: {
      schema
    }
  } = useContext(EsriDataTableContext);
  return (
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <EuiButtonIcon
          iconType="minusInCircle"
          color="danger"
          iconSize="s"
          onClick={onRemoveFilter}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        {filter.column} - {filter.kind} - {filter.ints}
      </EuiFlexItem>
    </EuiFlexGroup>
  )
}

interface FilterGroupPanelProps {
  title: string,
  filterGroup: FilterGroup,
  isRemovable: boolean,
  onRemoveGroup?: () => void,
  onAddFilter: () => void,
  onRemoveFilter: (i: number) => void,
};

const FilterGroupPanel: FunctionComponent<FilterGroupPanelProps> = ({
  title,
  filterGroup,
  isRemovable, onRemoveGroup = () => {},
  onAddFilter,
  onRemoveFilter,
}) => {
  return (
    <EuiPanel>
      <EuiFlexGroup>
        <EuiFlexItem grow={false} style={{ width: "100px" }}>
          <EuiFlexGroup gutterSize="s" alignItems="center">
            { isRemovable
              &&
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    iconType="minusInCircle"
                    color="danger"
                    iconSize="m"
                    onClick={onRemoveGroup}
                  />
                </EuiFlexItem>
            }
            <EuiFlexItem>
              <EuiTitle size="xs">
                <h1>{title}</h1>
              </EuiTitle>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
        <EuiFlexItem>
          {filterGroup.map((f, i) => <FilterListItem key={i} onRemoveFilter={() => onRemoveFilter(i)} filter={f} />)}
          <EuiButtonEmpty
            iconType="plusInCircle"
            color="primary"
            size="xs"
            onClick={onAddFilter}
          >
            Add Filter Criteria
          </EuiButtonEmpty>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
}

export interface FilterControlProps {};

export const FilterControl: FunctionComponent<FilterControlProps> = () => {
  const {
    state: {
      filters,
    },
    actions: {
      onAddAllFilter,
      onRemoveAllFilter,
      onAddFilter,
      onRemoveFilter,
      onAddGroup,
      onRemoveGroup,
    },
  } = useContext(EsriDataTableContext);

  return (
    <EuiFlexGroup direction="column" gutterSize="s" style={{minWidth: "600px"}}>
        <EuiFlexItem grow={false}>
          <FilterGroupPanel
            onRemoveFilter={onRemoveAllFilter}
            onAddFilter={onAddAllFilter}
            filterGroup={filters.all}
            isRemovable={false}
            title={`Global Filters`}
          />
        </EuiFlexItem>
        {
          filters.groups.map((fg, i) => (
            <EuiFlexItem grow={false} key={i}>
              <FilterGroupPanel
                onRemoveFilter={(fi) => onRemoveFilter(i, fi)}
                onAddFilter={() => onAddFilter(i)}
                filterGroup={fg}
                onRemoveGroup={() => onRemoveGroup(i)}
                isRemovable title={`Group ${i + 1}`}
              />
            </EuiFlexItem>
          ))
        }
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            iconType="plusInCircle"
            color="primary"
            onClick={onAddGroup}
          >
            Add Filter Group
          </EuiButtonEmpty>
        </EuiFlexItem>
    </EuiFlexGroup>
  )
}
