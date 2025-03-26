import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-account-blocked',
  templateUrl: './account-blocked.component.html',
  styleUrl: './account-blocked.component.css'
})
export class AccountBlockedComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadBlockedAccounts();
  }

  loadBlockedAccounts() {
    this.accountService.getBlockedAccounts().subscribe((data) => {
      this.accounts = data;
      this.filteredAccounts = [...this.accounts];
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

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  unblockAccount(id: number) {
    if (confirm('Bạn có chắc chắn muốn bỏ chặn tài khoản này?')) {
      this.accountService.putStatusActive(id).subscribe(
        () => {
          alert('Tài khoản đã được bỏ chặn!');
          this.filteredAccounts = this.filteredAccounts.filter(acc => acc.IdAccount !== id);
          if (this.filteredAccounts.length === 0 && this.currentPage > 1) {
            this.currentPage--;
            this.loadBlockedAccounts();
          }
        },
        () => {
          alert('Có lỗi xảy ra khi cập nhật trạng thái!');
        }
      );
    }
  }
}
