import { Component, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TodoService } from '../../services/todo';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  todos: any[] = [];

  private _searchText = '';
  
  get searchText() {
    return this._searchText;
  }
  
  set searchText(value: string) {
    this._searchText = value;
    this.limit = 4; // Reset page limit on new search query
  }

  todoData = {
    title: '',
    description: '',
    priority: 'Medium'
  };

  editMode = false;

  selectedTodoId = 0;

  userName = '';

  limit = 4; // Infinite scroll limit

  constructor(
    private todoService: TodoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    const userString = localStorage.getItem('user');
    if (!userString) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const user = JSON.parse(userString);
      this.userName = user.name || 'User';
    } catch {
      this.userName = 'User';
    }

    this.loadTodos();
  }

  get filteredTodos() {
    const priorityOrder: { [key: string]: number } = {
      'High': 1,
      'Medium': 2,
      'Low': 3
    };

    // 1. Filter by search text
    const result = this.todos.filter(todo =>
      todo.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      todo.description?.toLowerCase().includes(this.searchText.toLowerCase())
    );

    // 2. Sort by Priority (High -> Medium -> Low), and secondary by CreatedAt desc
    result.sort((a, b) => {
      const pA = priorityOrder[a.priority] || 2;
      const pB = priorityOrder[b.priority] || 2;

      if (pA !== pB) {
        return pA - pB;
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    // 3. Slice according to infinite scroll limit
    return result.slice(0, this.limit);
  }

  loadTodos() {
    this.todoService.getTodos().subscribe({
      next: (response: any) => {
        this.todos = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  addTodo() {
    if (!this.todoData.title.trim()) {
      return;
    }

    const payload = {
      title: this.todoData.title,
      description: this.todoData.description,
      priority: this.todoData.priority || 'Medium'
    };

    this.todoService.addTodo(payload)
      .subscribe({
        next: () => {
          this.todoData = {
            title: '',
            description: '',
            priority: 'Medium'
          };
          this.loadTodos();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  editTodo(todo: any) {
    this.editMode = true;
    this.selectedTodoId = todo.id;
    this.todoData = {
      title: todo.title,
      description: todo.description,
      priority: todo.priority || 'Medium'
    };
  }

  updateTodo() {
    const existingTodo = this.todos.find(
      x => x.id === this.selectedTodoId
    );

    const payload = {
      title: this.todoData.title,
      description: this.todoData.description,
      isCompleted: existingTodo?.isCompleted ?? false,
      priority: this.todoData.priority || 'Medium'
    };

    this.todoService.updateTodo(
      this.selectedTodoId,
      payload
    ).subscribe({
      next: () => {
        this.editMode = false;
        this.selectedTodoId = 0;
        this.todoData = {
          title: '',
          description: '',
          priority: 'Medium'
        };
        this.loadTodos();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedTodoId = 0;
    this.todoData = {
      title: '',
      description: '',
      priority: 'Medium'
    };
  }

  toggleComplete(todo: any) {
    const payload = {
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted,
      priority: todo.priority || 'Medium'
    };

    this.todoService.updateTodo(
      todo.id,
      payload
    ).subscribe({
      next: () => {
        this.loadTodos();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  deleteTodo(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.todoService.deleteTodo(id)
      .subscribe({
        next: () => {
          this.loadTodos();
        },
        error: (error) => {
          console.log(error);
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  trackByTodoId(index: number, item: any): number {
    return item.id;
  }

  hasMoreTodos(): boolean {
    const totalFiltered = this.todos.filter(todo =>
      todo.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      todo.description?.toLowerCase().includes(this.searchText.toLowerCase())
    ).length;

    return this.limit < totalFiltered;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Position of scroll + height of screen
    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.clientHeight;
    // Max height of page
    const max = document.documentElement.scrollHeight;

    // Load next 4 if scroll is within 50px of bottom
    if (pos >= max - 50) {
      const totalFiltered = this.todos.filter(todo =>
        todo.title?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        todo.description?.toLowerCase().includes(this.searchText.toLowerCase())
      ).length;

      if (this.limit < totalFiltered) {
        this.limit += 4;
      }
    }
  }
}