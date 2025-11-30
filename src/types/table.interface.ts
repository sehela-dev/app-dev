/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

export interface TableRowContent<T = any> {
  id: string;
  text: string | any;
  sort?: "asc" | "desc";
  isSkipSort?: boolean;
  value: keyof T | ((row: T, index: number) => string | React.ReactElement);
  span?: number;
  width?: number | string;
  whiteSpace?: string;
}
export interface TableActionsProps<T = any> {
  show?: boolean;
  text?: string;
  render?: (row: T, idx: number) => React.ReactElement;
}
interface TableNumbering<T = any> {
  // show number column when value is true
  show?: boolean;
  text: string;
  render: (row: T, idx: number) => React.ReactElement | number;
}

// type DeleteConfirmationMessage<T> = string | ReactNode | ((el: T) => ReactNode);

export interface TableContentProps<T = any> {
  headers?: TableRowContent<T>[];
  data?: T[];
  actionOptions?: TableActionsProps<T>;
  numberOptions?: TableNumbering<T>;
  showCheckbox?: boolean;
  onSelectAllRows?: any;
  showDeleteAllRows?: boolean;
  sort?: string;
  setSort?: any;
  emptyState?: React.ReactElement;
  onDelete?: (id: any) => void;
  onEdit?: (id: any) => void;
  isDeleted?: boolean;
  hasChild?: boolean;
  childHeader?: TableRowContent<T>[];
  parrentIndex?: number;
  showHeaders?: string[];
  showEmpty?: boolean;
  showLoading?: boolean;
  hover?: boolean;
  onClickDetail?: (data: any) => void;
  selectedAction?: React.ReactElement;
  reverseAction?: boolean;
  deleteConfirmationMessage?: string | ReactNode | ((el: Record<string, any>) => ReactNode);
  deleteLabel?: string;
  deleteOnly?: boolean;
  child?: any;
  onClickOptions?: (id: string | number) => void;
  tableHeadClass?: any;
  perPage?: number;
  isLoading?: boolean;
  setSelectedData?: (data: any) => void;
  selectedData?: any;
  objectKey?: any;
  isMultiple?: boolean;
}

export interface TableColumnFilterProps<T = any> {
  headers: TableRowContent<T>[];
  showHeader: string[];
  defaultHeaders: string[];
  setShowHeader?: any;
}
