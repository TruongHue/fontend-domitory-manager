import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router'; // ✅ Đảm bảo đã import Router
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userCode: string = '';
  password: string = '';
  errorMessage: string = '';
  invalidLogin: boolean = false;
  showPassword: boolean = false;
  idAccount: number = 0;
  idStudent:number = 0;

  constructor(private authService: AuthService, private router: Router,private userService: UserService) {} // ✅ Đảm bảo router được inject vào constructor

  onLogin() {
    this.authService.login(this.userCode, this.password).subscribe({
      next: (response) => {
        console.log('Đăng nhập thành công', response);

        // Lưu thông tin vào LocalStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('accountId', response.idAccount);
        localStorage.setItem('role', response.role);

        this.errorMessage = '';
        this.invalidLogin = false;

        // ✅ Kiểm tra role và điều hướng
        if (response.role == '0') {
          this.router.navigate(['/user']); // Admin
        } else if (response.role == '1') {
          this.router.navigate(['/admin']); // Admin
        } else if (response.role == '2') {
          this.router.navigate(['/staffs']); // Staff
        } else {
          this.router.navigate(['/login']); // Student
        }
      },
      error: (error: any) => {
        console.error('Đăng nhập thất bại', error);
        this.errorMessage = error.error?.message || 'Đăng nhập thất bại! Vui lòng thử lại.';
        this.invalidLogin = true;
      }
    });
  }


  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
