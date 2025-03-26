import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData: any = {
    Account: {
      UserName: "",
      UserCode: "",
      NumberPhone: "",
      Password: ""
    },
    InfoStudent: {
      Email: "",
      Gender: "0",
      Address: "",
      NameParent: "",
      ParentNumberPhone: ""
    }
  };
  confirmPassword: string = "";
  agreed: boolean = false;
  selectedFile: File | null = null;
  previewImage: string | null = null;
  uploadedImageUrl: string | null = null;
  errorMessage: string = "";
  
  constructor(private authService: AuthService, private router: Router) {
    this.registerData = {
      Account: {
        UserName: '',
        UserCode: '',
        NumberPhone: '',
        Password: '',
        Roles: 0,
        Status: 1
      },
      InfoStudent: {
        Gender: 0,
        Picture: '',
        Email: '',
        NameParent: '',
        Address: '',
        ParentNumberPhone: ''
      }
    };
  }
  
  // Xử lý khi chọn file
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Hiển thị ảnh xem trước
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onRegister() {
    this.errorMessage = "";
  
    // Kiểm tra dữ liệu không bị null hoặc undefined
    if (!this.registerData) {
      this.errorMessage = "Dữ liệu đăng ký không hợp lệ!";
      return;
    }
  
    if (!this.registerData.Account) this.registerData.Account = {};
    if (!this.registerData.InfoStudent) this.registerData.InfoStudent = {};
  
    if (this.registerData.Account.Password !== this.confirmPassword) {
      this.errorMessage = "Mật khẩu không khớp!";
      return;
    }
    if (!this.registerData.Account.Email) {
      this.errorMessage = "Email không hợp lệ!";
      return;
    }
    if (!this.agreed) {
      this.errorMessage = "Bạn cần đồng ý với cam kết!";
      return;
    }
  
    const formData = new FormData();
  
    // Duyệt qua từng key của Account
    Object.entries(this.registerData.Account || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(`Account.${key}`, value as string);
      }
    });
  
    Object.entries(this.registerData.InfoStudent || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(`InfoStudent.${key}`, value as string);
      }
    });
  
    if (this.selectedFile) {
      formData.append("file", this.selectedFile);
    }
  
    // Debug FormData trước khi gửi đi
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });
  
    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log("✅ Đăng ký thành công", response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error("❌ Đăng ký thất bại", error);
        this.errorMessage = error.error?.message || "Có lỗi xảy ra khi đăng ký.";
      }
    });
  }
  
  
}
