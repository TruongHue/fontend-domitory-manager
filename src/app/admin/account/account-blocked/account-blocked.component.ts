import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-account-blocked',
  templateUrl: './account-blocked.component.html',
  styleUrls: ['./account-blocked.component.css', '../../../app.component.css']

})
export class AccountBlockedComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isLoading: boolean = false;
  selectedAccount: any = null;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadBlockedAccounts();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
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

  loadBlockedAccounts() {
    this.isLoading = true; // Bắt đầu loading
    this.accountService.getBlockedAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.filteredAccounts = [...this.accounts];
        this.isLoading = false; // ✅ Kết thúc loading khi thành công
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách tài khoản bị khóa:', err);
        this.isLoading = false; // ✅ Kết thúc loading khi có lỗi
      }
    });
  }    

  searchAccounts() {
    this.filteredAccounts = this.accounts.filter(account =>
      account.UserName.toLowerCase().includes(this.searchText.toLowerCase()) ||
      account.UserCode.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.currentPage = 1;
  }

  get pagedAccounts() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAccounts.slice(start, start + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `http://localhost:5048/images/${imagePath}` : 'assets/default-avatar.png';
  }



  unblockAccount(id: string) {
    const status = { Status: 0 }; // Object status đúng định dạng
  
    if (confirm('Bạn có chắc chắn muốn bỏ chặn tài khoản này?')) {
      this.accountService.putStatus(id, status).subscribe(
        () => {
          alert('Tài khoản đã được bỏ chặn!');
  
          // Nếu chỉ còn 1 tài khoản trên trang hiện tại, lùi về trang trước
          if (this.filteredAccounts.length === 1 && this.currentPage > 1 ) {
            this.currentPage--;
          }
          if (this.filteredAccounts.length === 1 && this.currentPage === 1 ) {
            this.currentPage = 0 ;
          }
          // Cập nhật danh sách tài khoản
          this.loadBlockedAccounts();
        },
        () => {
          alert('Có lỗi xảy ra khi cập nhật trạng thái!');
        }
      );
    }
  }
  detail(account: any) {
    this.selectedAccount = account;
  }
}
