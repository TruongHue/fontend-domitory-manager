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

  constructor(private accountService: AccountService, private toastr: ToastrService) {}

  ngOnInit() {
    this.loadAccounts();
  }
  importFile(event: any) {
    this.isLoading= true;
    const file = event.target.files[0];
    if (file) {
      this.accountService.importExcel(file).subscribe({
        next: (res) => {
          const message = res.message || 'Import thành công!';
          alert(`✅ Thành công!\n${message}\nTổng cộng: ${res.count} sinh viên.`);
          this.loadAccounts();
          event.target.value = null; // Reset input file
          this.loadAccounts();
          this.isLoading = false;
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Import thất bại!';
          alert(`❌ Lỗi\n${errorMessage}`);
          this.isLoading = false;
        }
        
      });
    } else {
      this.toastr.warning('⚠️ Vui lòng chọn file Excel trước khi import.', 'Chưa chọn file');
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
  
  

  getImageUrl(imagePath: string): string {
    return imagePath ? `http://localhost:5048/images/${imagePath}` : 'assets/default-avatar.png';
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
          ? this.getImageUrl(account.InfoStudent.Picture)
          : 'Không có ảnh'
      }))
    );
    
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sinh viên');

    // Xuất file Excel
    XLSX.writeFile(workbook, 'Danh_sach_sinh_vien.xlsx');
  }
}
