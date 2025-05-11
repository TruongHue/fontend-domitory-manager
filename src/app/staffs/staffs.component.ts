import { Component } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { PostmanagerService } from '../services/post/postmanager.service';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-staffs',
  templateUrl: './staffs.component.html',
  styleUrl: './staffs.component.css'
})
export class StaffsComponent {
  unrespondedRequestsCount: number = 0;
  helpRequests: any[] = []; // Chỉ chứa các yêu cầu hỗ trợ
  isLoading: boolean = true;

  constructor(private authService: AuthService, private requestService: PostmanagerService, private accountService: AccountService) {}

  logout() {
    this.authService.logout();
  }
  ngOnInit(): void {
    this.fetchHelpRequests();
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
}
