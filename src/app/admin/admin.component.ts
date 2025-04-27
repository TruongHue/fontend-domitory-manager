import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { PostmanagerService } from '../services/post/postmanager.service';
import { AccountService } from '../services/account.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  helpRequests: any[] = []; // Chỉ chứa các yêu cầu hỗ trợ
  unrespondedRequestsCount: number = 0;
  activeTab: string = 'account-list-inactive';
  isLoading: boolean = true;
  accounts: any[] =[];
  waitingAccountsCount: number = 0;

  constructor(private authService: AuthService, private requestService: PostmanagerService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.fetchHelpRequests();
    this.loadAccounts();
  }

  loadAccounts() {
    this.isLoading = true; // Bắt đầu loading
    this.accountService.getWaitAccounts().pipe(
      catchError((error) => {
        this.isLoading = false; // Kết thúc loading ngay cả khi có lỗi
        console.error('Có lỗi xảy ra:', error);
        return of([]); // Trả về giá trị mặc định là mảng rỗng
      })
    ).subscribe((data) => {
      this.accounts = data;
      this.isLoading = false; // Kết thúc loading

      // Tính số lượng tài khoản đợi (dựa trên dữ liệu từ API)
      this.waitingAccountsCount = this.accounts.filter(account => account.Account.Status === 3).length;
    });
  }

  fetchHelpRequests(): void {
    this.isLoading = true;
  
    this.requestService.getAllFeedbacks().subscribe({
      next: (data: any[]) => {
        console.log('Feedbacks:', data);  // Log để debug dữ liệu
  
        this.helpRequests = data
          // Không cần lọc theo type/category nếu dữ liệu không có các trường đó
          .map(item => {
            const response = item.Feedback?.Response || '';
            const isResponded = response.trim() !== '';
  
            return {
              ...item,
              IsResponded: isResponded,
              Responses: isResponded ? [response] : []
            };
          });
  
        this.updateUnrespondedRequestsCount();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy yêu cầu:', err);
        this.isLoading = false;
      }
    });
  }
  
  updateUnrespondedRequestsCount(): void {
    this.unrespondedRequestsCount = this.helpRequests.filter(req => !req.IsResponded).length;
  }
  

  logout() {
    this.authService.logout();
  }
}
