import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css', '../../app.component.css']

})
export class PersonalComponent implements OnInit {
  profile: any = [];
  isLoading: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true; // Bắt đầu loading

    const userId = localStorage.getItem('accountId');
    if (userId) {
      this.userService.getUsersById(userId).subscribe(
        (response) => {
         this.profile = response;
         this.isLoading = false; // Bắt đầu loading

        },
        (error) => {
          console.error('Lỗi khi tải thông tin người dùng', error);
          this.isLoading = false; // Bắt đầu loading

        }
      );
    }
  }

  
  editProfile() {
    alert('Chức năng chỉnh sửa đang phát triển...');
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `http://domitory-backend.onrender.com/images/${imagePath}` : 'assets/default-avatar.png';
  }
}
