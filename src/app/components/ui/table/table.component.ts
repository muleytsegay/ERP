import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon?: string;
  action: (row: any) => void;
  condition?: (row: any) => boolean;
  class?: string;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() striped = true;
  @Input() hover = true;
  @Input() bordered = true;
  @Input() actions: TableAction[] = [];
  @Input() selectable = false;
  @Input() emptyMessage = 'No data available';
  
  @Output() rowClick = new EventEmitter<any>();
  @Output() sort = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() selectionChange = new EventEmitter<any[]>();

  selectedRows: any[] = [];
  sortColumn?: string;
  sortDirection: 'asc' | 'desc' = 'asc';

  onSort(column: TableColumn) {
    if (!column.sortable) return;
    
    if (this.sortColumn === column.key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column.key;
      this.sortDirection = 'asc';
    }
    
    this.sort.emit({ column: column.key, direction: this.sortDirection });
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onRowSelect(row: any, checked: boolean) {
    if (checked) {
      this.selectedRows.push(row);
    } else {
      const index = this.selectedRows.indexOf(row);
      if (index > -1) {
        this.selectedRows.splice(index, 1);
      }
    }
    this.selectionChange.emit([...this.selectedRows]);
  }

  onSelectAll(checked: boolean) {
    if (checked) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectionChange.emit([...this.selectedRows]);
  }

  isSelected(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  get indeterminate(): boolean {
    return this.selectedRows.length > 0 && this.selectedRows.length < this.data.length;
  }

  getValue(row: any, key: string): any {
    return key.split('.').reduce((obj, prop) => obj?.[prop], row);
  }

  shouldShowAction(action: TableAction, row: any): boolean {
    return action.condition ? action.condition(row) : true;
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
