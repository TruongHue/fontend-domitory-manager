import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { UserService } from '../services/user/user.service';
import { response } from 'express';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit {
  isSidebarOpen = true;
  userCode:string = '';
  fullName:string = '';
  email:string='';
  picture:string='';
  constructor(private authService: AuthService, private userService:UserService) {}

  ngOnInit(): void {
    this.loadUserInfo(); // Gọi hàm để lấy thông tin người dùng khi component được load
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  loadUserInfo(){
    const userId = localStorage.getItem('accountId');
    if(userId){
    this.userService.getUsersById(userId).subscribe(
    (response) =>{
      this.userCode =response.Account?.UserCode || 'Không có mã';
      this.fullName = response.Account?.UserName || 'Không có tên';
      this.email = response.InfoStudent?.Email || 'Không có email';
      this.picture = response.InfoStudent?.Picture || 'Không có ảnh';
    },
    (error) => {
      console.error('Lỗi khi tải thông tin người dùng',error);
    }
    )
  }
  }
  
  
    logout() {
      this.authService.logout();
    }
}


