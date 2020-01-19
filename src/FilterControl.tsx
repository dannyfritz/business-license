import React, { FunctionComponent, useCallback } from "react";
import {
  EuiButtonIcon,
  EuiButtonEmpty,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
} from '@elastic/eui';

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

enum SchemaKind {
  Int,
  Float,
  Date,
  String,
};

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
          {filterGroup.map((f, i) => <FilterListItem onRemoveFilter={() => onRemoveFilter(i)} filter={f} />)}
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

export interface FilterControlProps {
  filterInput: FilterInput,
  onSetFilterInput: (filterInput: FilterInput) => void,
};

export const FilterControl: FunctionComponent<FilterControlProps> = ({
  filterInput, onSetFilterInput,
}) => {
  const onRemoveGroup = useCallback(
    (index) => onSetFilterInput({
      ...filterInput,
      groups: filterInput.groups.filter((_, i) => i !== index)
    }),
    [filterInput, onSetFilterInput],
  )
  const onAddAllFilter = useCallback(
    () => onSetFilterInput({
      ...filterInput,
      all: [...filterInput.all, {}],
    }),
    [filterInput, onSetFilterInput],
  )
  const onRemoveAllFilter = useCallback(
    (index) => onSetFilterInput({
      ...filterInput,
      all: filterInput.all.filter((_, i) => i !== index),
    }),
    [filterInput, onSetFilterInput],
  )
  const onAddFilter = useCallback(
    (index) => {
      const group = [...filterInput.groups[index], {}];
      const groups = [...filterInput.groups];
      groups[index] = group;
      onSetFilterInput({
        ...filterInput,
        groups
      });
    },
    [filterInput, onSetFilterInput],
  )
  const onRemoveFilter = useCallback(
    (groupIndex, index) => {
      const group = filterInput.groups[groupIndex].filter((_, i) => i !== index);
      const groups = [...filterInput.groups];
      groups[groupIndex] = group;
      onSetFilterInput({
        ...filterInput,
        groups
      });
    },
    [filterInput, onSetFilterInput],
  )
  return (
    <EuiFlexGroup direction="column" gutterSize="s" style={{minWidth: "600px"}}>
        <EuiFlexItem grow={false}>
          <FilterGroupPanel
            onRemoveFilter={onRemoveAllFilter}
            onAddFilter={onAddAllFilter}
            filterGroup={filterInput.all}
            isRemovable={false}
            title={`All Groups`}
          />
        </EuiFlexItem>
        {
          filterInput.groups.map((fg, i) => (
            <EuiFlexItem grow={false} key={i}>
              <FilterGroupPanel
                onRemoveFilter={(fi) => onRemoveFilter(i, fi)}
                onAddFilter={() => onAddFilter(i)}
                filterGroup={fg}
                onRemoveGroup={() => onRemoveGroup(i)}
                isRemovable title={`Group ${i}`}
              />
            </EuiFlexItem>
          ))
        }
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            iconType="plusInCircle"
            color="primary"
            onClick={() => {onSetFilterInput({
              ...filterInput,
              groups: [...filterInput.groups, []],
            })}}
          >
            Add Filter Group
          </EuiButtonEmpty>
        </EuiFlexItem>
    </EuiFlexGroup>
  )
}
