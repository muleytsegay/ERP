import { Pipe, PipeTransform } from '@angular/core';

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform(items: Todo[], searchText: string): Todo[] {
    if (!items || !searchText) return items;
    const lower = searchText.toLowerCase();
    return items.filter(todo => todo.title.toLowerCase().includes(lower));
  }
}
