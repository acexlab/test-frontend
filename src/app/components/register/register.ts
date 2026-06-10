import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {

    this.authService.register(this.registerData)
      .subscribe({
        next: () => {

          alert('Registration Successful');

          this.router.navigate(['/login']);
        },

        error: () => {
          alert('Registration Failed');
        }
      });

  }
}