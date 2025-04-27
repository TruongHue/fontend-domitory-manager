import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-staff-manager',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css', '../../app.component.css']
})
export class StaffComponent implements OnInit {

  accounts: any[] = []; // Tất cả tài khoản
  filteredAccounts: any[] = []; // Tài khoản đã lọc theo tìm kiếm
  searchText: string = ''; // Text tìm kiếm
  currentPage: number = 1; // Trang hiện tại
  itemsPerPage: number = 10; // Số mục mỗi trang
  totalPages: number = 1; // Tổng số trang
  isFormVisible: boolean = false; // Ẩn form khi load trang
  newAccount: any = { UserName: '', UserCode: '', NumberPhone: '', Password: '' }; // Lưu dữ liệu nhập vào form
  isLoading: boolean = false;


  constructor(private accountService: AccountService) {}

  ngOnInit() {
    // Gọi API để lấy tất cả tài khoản
    this.loadStaff();
  }

  loadStaff() {
    this.isLoading = true; // Bắt đầu loading
    this.accountService.getAllStaffs().subscribe(data => {
      this.accounts = data;
      this.filteredAccounts = data; // Ban đầu không lọc
      this.setPagination();
      this.isLoading = false; // Kết thúc loading
    });
  }

  // Tìm kiếm
  onSearchChange() {
    this.filteredAccounts = this.accounts.filter(account =>
      account.Account.UserName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      account.Account.UserCode.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.setPagination(); // Cập nhật lại pagination sau khi lọc
  }

  setPagination() {
    this.totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
    this.changePage(1); // Luôn về trang đầu khi có thay đổi
  }

  changePage(page: number) {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
  
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  
  this.filteredAccounts = this.accounts.filter(account =>
    account.Account.UserName.toLowerCase().includes(this.searchText.toLowerCase()) ||
    account.Account.UserCode.toLowerCase().includes(this.searchText.toLowerCase())
  );

  this.filteredAccounts = this.filteredAccounts.slice(startIndex, endIndex);
}

  blockAccount(accountId: string) {
    console.log(accountId);
    // Hiển thị hộp thoại xác nhận trước khi xóa
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?');
  
    if (confirmDelete) {
      // Gọi API xóa tài khoản nếu người dùng xác nhận
      this.accountService.DeleteStaffs(accountId).subscribe({
        next: (data) => {
          // Cập nhật lại danh sách tài khoản sau khi xóa
          this.accounts = data;
          this.filteredAccounts = data;  // Ban đầu không lọc
          this.setPagination();  // Cập nhật lại phân trang
          console.log(`Đã xóa tài khoản với ID: ${accountId}`);
        },
        error: (err) => {
          console.error('Xảy ra lỗi khi xóa tài khoản:', err);
          alert('Không thể xóa tài khoản. Vui lòng thử lại sau.');
        }
      });
    } else {
      console.log('Tài khoản không được xóa');
    }
  }
  

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.changePage(this.currentPage);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.changePage(this.currentPage);
    }
  }

  showForm() {
    this.isFormVisible = true
    }

    hideForm() {
      this.isFormVisible = false;
      this.newAccount = { UserName: '', UserCode: '', NumberPhone: '' }; // Reset dữ liệu
    }

    addAccount() {
      console.log(this.newAccount);
      if (!this.newAccount.UserName || !this.newAccount.UserCode || !this.newAccount.NumberPhone || !this.newAccount.Password) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
      }
    
      console.log('Thêm tài khoản:', this.newAccount);
    
      // Gọi API thêm tài khoản
      this.accountService.addAccount(this.newAccount).subscribe({
        next: (data) => {
          console.log('Tài khoản đã thêm:', data);
          
          // Thêm vào danh sách
          this.accounts.push(data);
          this.filteredAccounts = [...this.accounts]; 
          this.setPagination();  
    
          // Đóng form và reset dữ liệu
          this.hideForm();
          this.newAccount = { UserName: '', UserCode: '', NumberPhone: '', Password: '' };
    
          alert('Thêm tài khoản thành công!');
          this.loadStaff();
        },
        error: (err) => {
          console.error('Lỗi khi thêm tài khoản:', err);
          alert('Không thể thêm tài khoản. Vui lòng thử lại!');
        }
      });
    }
    
}
