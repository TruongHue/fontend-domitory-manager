import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css'
})
export class PersonalComponent implements OnInit {
  profile = {
    userCode: '',
    fullName: '',
    gender:null,
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    picture: ''
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userId = Number(localStorage.getItem('accountId'));
    if (userId) {
      this.userService.getUsersById(userId).subscribe(
        (response) => {
          this.profile.userCode = response.Account?.UserCode || 'Không có mã';
          this.profile.fullName = response.InfoStudent?.Name || 'Không có tên';
          this.profile.gender = response.InfoStudent?.Gender || 'Không có giới tính';
          this.profile.email = response.InfoStudent?.Email || 'Không có email';
          this.profile.phone = response.Account?.NumberPhone || 'Không có SĐT';
          this.profile.address = response.InfoStudent?.Address || 'Không có địa chỉ';
          this.profile.parentName = response.InfoStudent?.NameParent || 'Không có tên phụ huynh';
          this.profile.parentPhone = response.InfoStudent?.ParentNumberPhone || 'Không có SĐT phụ huynh';
          this.profile.picture = response.InfoStudent?.Picture || 'assets/default-avatar.png';
        },
        (error) => {
          console.error('Lỗi khi tải thông tin người dùng', error);
        }
      );
    }
  }

  editProfile() {
    alert('Chức năng chỉnh sửa đang phát triển...');
  }
}
