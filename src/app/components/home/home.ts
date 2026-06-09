import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  todoData = {
    title: '',
    description: ''
  };

  editMode = false;

  selectedTodoId = 0;

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
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

    if (!this.todoData.title) {
      //alert('Title is required');
      return;
    }

    this.todoService.addTodo(this.todoData)
      .subscribe({
        next: () => {

          this.todoData = {
            title: '',
            description: ''
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
      description: todo.description
    };
  }

  updateTodo() {

    const payload = {
      title: this.todoData.title,
      description: this.todoData.description,
      isCompleted: false
    };

    this.todoService.updateTodo(
      this.selectedTodoId,
      payload
    )
    .subscribe({
      next: () => {

        this.editMode = false;

        this.todoData = {
          title: '',
          description: ''
        };

        this.loadTodos();
      },

      error: (error) => {
        console.log(error);
      }
    });
  }

  deleteTodo(id: number) {

    if (!confirm('Delete this todo?')) {
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
}