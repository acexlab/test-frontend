import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  private apiUrl = 'http://localhost:5000/api/Todo';

  constructor(private http: HttpClient) {}

  getTodos() {
    return this.http.get(this.apiUrl);
  }

  addTodo(data: any) {
    return this.http.post(
      this.apiUrl,
      data
    );
  }

  updateTodo(id: number, data: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deleteTodo(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}