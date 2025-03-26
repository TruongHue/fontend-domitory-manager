import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrl: './account-list.component.css'
})
export class AccountListComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getActiveAccounts().subscribe((data) => {
      this.accounts = data;
      this.filteredAccounts = [...this.accounts];
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
    if (page >= 1 && page <= this.getTotalPages().length) {
      this.currentPage = page;
    }
  }

  getTotalPages(): number[] {
    const totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getImageUrl(imagePath: string): string {
    return imagePath ? `http://localhost:5048/images/${imagePath}` : 'assets/default-avatar.png';
  }

  blockAccount(accountId: number) {
    if (confirm('Bạn có chắc chắn muốn chặn tài khoản này?')) {
      this.accountService.putStatusBlocked(accountId).subscribe(
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
}
