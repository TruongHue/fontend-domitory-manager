import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import * as XLSX from 'xlsx'; // Import thư viện xlsx
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css', '../../../app.component.css']

})
export class AccountListComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  isLoading: boolean = false;
  selectedAccount: any = null;
  selectedFile: File | null = null;
  excelFile: File | null = null;
  imageFiles: File[] = [];
  isModalOpen = false; // Để điều khiển việc hiển thị modal
  successMessage = '';
  errorMessage = '';

  constructor(private accountService: AccountService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadAccounts();
  }
 
  openImportModal() {
    this.isModalOpen = true;
  }

  // Đóng modal
  closeImportModal() {
    this.isModalOpen = false;
  }
 
  onExcelFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.excelFile = file;
    }
  }

  
  onImageFilesChange(event: any) {
    this.imageFiles = Array.from(event.target.files); // Chuyển thành mảng
  }

  onImportSubmit() {
    // Chỉ khi đã chọn đủ cả 2 file mới gửi
    if (this.excelFile && this.imageFiles.length > 0) {
      this.isLoading = true;
      this.uploadFiles();
    } else {
      this.errorMessage = 'Vui lòng chọn cả file Excel và ảnh!';
      this.successMessage = '';
      this.isLoading = false;
    }
  }

  uploadFiles() {
    if (this.excelFile && this.imageFiles.length > 0) {
      this.accountService.importExcel(this.excelFile, this.imageFiles).subscribe({
        next: async (response) => {
          const contentType = response.headers.get('Content-Type');
      
          if (contentType && contentType.includes('application/json')) {
            // Convert blob to text, then parse JSON
            const text = await response.body.text();
            const json = JSON.parse(text);
            this.successMessage = json.message;
            this.errorMessage = '';
            this.loadAccounts();
            this.isLoading = false; // 👉 tắt loading ở đây
          } else {
            // Là file => tạo link tải
            const blob = response.body;
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'DanhSachLoi.xlsx';
            link.click();
            alert
            this.errorMessage = '';
            this.loadAccounts();
            this.isLoading = false; // 👉 tắt loading ở đây

          }
        },
        error: (err) => {
          this.errorMessage = 'Upload failed: ' + err.message;
          this.successMessage = '';
          this.isLoading = false; // 👉 tắt loading ở đây
        }
      });      
    }
    
  }
  


  loadAccounts() {
    this.isLoading = true; // Bắt đầu loading
    this.accountService.getActiveAccounts().subscribe((data) => {
      this.accounts = data;
      this.filteredAccounts = [...this.accounts];
      this.isLoading = false; // Kết thúc loading
    });
  }

  searchAccounts() {
    this.filteredAccounts = this.accounts.filter(account =>
      account.UserName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      account.UserCode.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.currentPage = 1; // Reset về trang đầu khi tìm kiếm
  }

  get pagedAccounts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAccounts.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }
  

  getTotalPages(): number {
    return Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
  }
  

  blockAccount(accountId: string) {
    const requestBody = { Status: 2 }; // Truyền đúng định dạng yêu cầu
    if (confirm('Bạn có chắc chắn muốn chặn tài khoản này?')) {
      this.accountService.putStatus(accountId,requestBody ).subscribe(
        () => {
          alert('Tài khoản đã bị chặn!');
          this.loadAccounts();
        },
        (error) => {
          alert('Có lỗi xảy ra, vui lòng thử lại.');
          console.error(error);
        }
      );
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }
  detail(account: any) {
    this.selectedAccount = account;
  }
  
  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.filteredAccounts.map((account, index) => ({
        'STT': index + 1,
        'Tên đăng nhập': account.Account.UserName,
        'Mã sinh viên': account.Account.UserCode,
        'Số điện thoại': account.Account.NumberPhone,
        'Email': account.InfoStudent.Email,
        'Giới tính': account.InfoStudent.Gender === 0 ? 'Nam' : 'Nữ',
        'Tên phụ huynh': account.InfoStudent.NameParent,
        'SĐT phụ huynh': account.InfoStudent.ParentNumberPhone,
        'Địa chỉ': account.InfoStudent.Address,
        'Hình ảnh': account.InfoStudent?.Picture
      }))
    );
    
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');

    // Xuất file Excel
    XLSX.writeFile(workbook, 'Danh_sach_sinh_vien.xlsx');
  }

  resetPassword(accountId: string): void {
    if (!confirm('Bạn có chắc muốn cấp lại mật khẩu cho tài khoản này?')) return;
  
    this.accountService.resetPassword(accountId).subscribe({
      next: () => {
        alert('✅ Cấp lại mật khẩu thành công!');
      },
      error: () => {
        alert('❌ Cấp lại mật khẩu thất bại!');
      }
    });
  }
  
}
