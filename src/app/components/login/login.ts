import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {

    this.authService.login(this.loginData)
      .subscribe({
        next: (response: any) => {

          localStorage.setItem(
            'user',
            JSON.stringify(response)
          );

          //alert('Login Successful');

          this.router.navigate(['/home']);
        },

        error: () => {
          alert('Invalid Credentials');
        }
      });

  }
}