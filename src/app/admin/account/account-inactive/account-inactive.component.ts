import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-account-inactive',
  templateUrl: './account-inactive.component.html',
  styleUrl: './account-inactive.component.css'
})
export class AccountInactiveComponent implements OnInit {
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
    this.accountService.getInactiveAccounts().subscribe((data) => {
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

  approveAccount(id: number) {
    this.accountService.putStatusActive(id).subscribe(
      () => {
        alert('Tài khoản đã được kích hoạt thành công!');
        this.filteredAccounts = this.filteredAccounts.filter(acc => acc.IdAccount !== id);
        if (this.filteredAccounts.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.loadAccounts();
        }
      },
      () => {
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    );
  }

  rejectAccount(id: number) {
    this.accountService.putStatusBlocked(id).subscribe(
      () => {
        alert('Tài khoản đã bị từ chối!');
        this.filteredAccounts = this.filteredAccounts.filter(acc => acc.IdAccount !== id);
        if (this.filteredAccounts.length === 0 && this.currentPage > 1) {
          this.currentPage--;
          this.loadAccounts();
        }
      },
      () => {
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    );
  }
}
