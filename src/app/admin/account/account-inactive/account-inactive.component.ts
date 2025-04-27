import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../services/account.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-account-inactive',
  templateUrl: './account-inactive.component.html',
  styleUrls: ['./account-inactive.component.css', '../../../app.component.css']

})
export class AccountInactiveComponent implements OnInit {
  accounts: any[] = [];
  filteredAccounts: any[] = [];
  searchText: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isLoading: boolean = false;
  selectedAccount: any = null;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.loadAccounts();
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
  
  detail(account: any) {
    this.selectedAccount = account;
  }

  loadAccounts() {
    this.isLoading = true; // Bắt đầu loading
    this.accountService.getWaitAccounts().pipe(
      catchError((error) => {
        this.isLoading = false; // Kết thúc loading ngay cả khi có lỗi
        console.error('Có lỗi xảy ra:', error);
        return of([]); // Hoặc bạn có thể trả về giá trị mặc định khác nếu muốn
      })
    ).subscribe((data) => {
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



  approveAccount(id: string) {
    const requestBody = { Status: 0 };
  
    this.accountService.putStatus(id, requestBody).subscribe(
      () => {
        alert('Tài khoản đã được kích hoạt thành công!');
  
        // Kiểm tra nếu chỉ còn 1 người trong danh sách hiện tại
        if (this.filteredAccounts.length === 1 && this.currentPage > 1) {
          this.currentPage--; // Nếu không phải trang đầu thì lùi lại 1 trang
        }
  
        // Luôn gọi lại loadAccounts() để cập nhật UI
        this.loadAccounts();
      },
      () => {
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    );
  }
  

  rejectAccount(id: string) {
    const requestBody = { Status: 2 }; // Truyền đúng định dạng yêu cầu

    this.accountService.putStatus(id,requestBody).subscribe(
      () => {
        alert('Tài khoản đã bị từ chối!');
        this.loadAccounts();
        if (this.filteredAccounts.length === 1 && this.currentPage > 1) {
          this.currentPage--;
          this.loadAccounts();
        }if (this.filteredAccounts.length === 1 && this.currentPage === 1) {
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
