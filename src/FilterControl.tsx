import React, { FunctionComponent, useCallback, useContext, useState } from "react";
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiInputPopover,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiSelectable,
  EuiToken,
  EuiTitle,
} from '@elastic/eui';
import { SchemaKind, EsriDataTableContext } from "./SitePlansTable";
import { TokenColor } from "@elastic/eui/src/components/token/token_map";

export interface FilterInput {
  all: FilterGroup,
  groups: Array<FilterGroup>,
}

export enum CriteriaType {
  NotNull = "NotNull",
  IsNull = "IsNull",
  EqualTo = "EqualTo",
  LessThanOrEqual = "LessThanOrEqual",
  GreaterThanOrEqual = "GreaterThanOrEqual",
  Between = "Between",
  Contains = "Contains",
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

const getTypeIcon = (type: SchemaKind) => {
  switch(type) {
    case SchemaKind.Date:
      return { type: 'calendar', color: 'tokenTint07' as TokenColor };
    case SchemaKind.Float:
    case SchemaKind.Int:
      return { type: 'number', color: 'tokenTint04' as TokenColor };
    case SchemaKind.String:
      return { type: 'string', color: 'tokenTint01' as TokenColor };
    default:
      return { type: 'nested', color: 'tokenTint02' as TokenColor }
  }
}

const FilterListItem: FunctionComponent<FilterListProps> = ({
  filter, onRemoveFilter
}) => {
  const {
    state: {
      schema
    }
  } = useContext(EsriDataTableContext);

  const [isColumnSearchOpen, setIsColumnSearchOpen] = useState(false);

  const [columnSearch, setColumnSearch] = useState("");

  const columnSuggestions = schema
    .sort((a,b) => a.column < b.column ? -1 : 1)
    .filter(s => s.column.includes(columnSearch.toUpperCase()))
    .map(s => ({
      append: <EuiToken
        iconType={getTypeIcon(s.type).type}
        displayOptions={{
          color: getTypeIcon(s.type).color,
        }}
      />,
      label: s.column,
    }))

  const criteriaSuggestions = [];

  return (
    <EuiPanel paddingSize="s">
      <EuiFlexGroup alignItems="center">
        <EuiFlexItem grow={false}>
          <EuiButtonIcon
            iconType="minusInCircle"
            color="danger"
            iconSize="m"
            onClick={onRemoveFilter}
            aria-label="remove filter"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiInputPopover
            panelPaddingSize="none"
            closePopover={() => setIsColumnSearchOpen(false)}
            isOpen={isColumnSearchOpen}
            input={
              <EuiFieldSearch
                placeholder="Column to filter"
                onFocus={() => setIsColumnSearchOpen(true)}
                value={columnSearch}
                onChange={(e) => {
                  if (typeof e === "string") {
                    setColumnSearch(e);
                    return;
                  }
                  setColumnSearch(e.target.value)
                }}
              />
            }
          >
            <EuiSelectable
              options={columnSuggestions}
              onChange={(options) => {
                const match = options.find(o => o.checked);
                if (!match) {
                  setColumnSearch("");
                } else {
                  setColumnSearch(match.label);
                }
                setIsColumnSearchOpen(false);
              }}
              singleSelection={true}
              listProps={{ bordered: true, showIcons: false }}
            >
              {list => list}
            </EuiSelectable>
          </EuiInputPopover>
        </EuiFlexItem>
        <EuiFlexItem>
          Criteria
        </EuiFlexItem>
        <EuiFlexItem>
          {filter.column} - {filter.kind} - {filter.ints}
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
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
                    aria-label="remove group"
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
          <EuiFlexGroup direction="column" gutterSize="s">
            {filterGroup.map((f, i) => (
              <EuiFlexItem>
                <FilterListItem key={i} onRemoveFilter={() => onRemoveFilter(i)} filter={f} />
              </EuiFlexItem>
            ))}
            <EuiFlexItem>
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
    <EuiFlexGroup direction="column" gutterSize="s" style={{minWidth: "800px"}}>
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
