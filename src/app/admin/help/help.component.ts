import { Component, OnInit } from '@angular/core';
import { PostmanagerService } from '../../services/post/postmanager.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css', '../../app.component.css']
})
export class HelpComponent implements OnInit {
  requests: any[] = [];
  unrespondedRequestsCount: number = 0;
  showResponseDetails: boolean = false;
  selectedRequest: any = null;
  isLoading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  filteredHelps: any[] = [];
  help: any[] = [];
  statusFilter: string = 'all';  // Bộ lọc trạng thái, mặc định là "Tất cả"
  newResponseText: string = ''; // lưu nội dung phản hồi mới

  constructor(private requestService: PostmanagerService) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredHelps.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  viewResponseDetails(request: any): void {
    this.selectedRequest = request;
    this.showResponseDetails = true;
  }

  filterRequests(): void {
    if (this.statusFilter === 'responded') {
      this.filteredHelps = this.requests.filter(request => request.IsResponded);
    } else if (this.statusFilter === 'unresponded') {
      this.filteredHelps = this.requests.filter(request => !request.IsResponded);
    } else {
      this.filteredHelps = [...this.requests];  // "Tất cả"
    }
  }

  fetchRequests(): void {
    this.isLoading = true; // Bắt đầu loading

    this.requestService.getAllFeedbacks().subscribe({
      next: (data: any[]) => {
        this.help = data;
        this.filteredHelps = [...this.help];
        
        // Cập nhật requests từ phản hồi của API
        this.requests = data.map((feedback: any) => ({
          ...feedback,
          IsResponded: feedback.Feedback.Response && feedback.Feedback.Response.trim() !== '',
          Responses: feedback.Feedback.Response ? [feedback.Feedback.Response] : [] // Thêm phản hồi nếu có
        }));

        this.filterRequests();
        this.updateUnrespondedRequestsCount();
        this.isLoading = false; // ✅ Tắt loading khi hoàn tất
      },
      error: (err) => {
        console.error('Lỗi khi lấy yêu cầu:', err);
        this.isLoading = false; // ✅ Tắt loading khi có lỗi
      }
    });
  }

  updateUnrespondedRequestsCount(): void {
    this.unrespondedRequestsCount = this.requests.filter(request => !request.IsResponded).length;
  }

  respondToRequest(requestId: string): void {
    // Logic để phản hồi yêu cầu (có thể thêm trạng thái hoặc làm gì đó ở đây)
  }

  closeResponseDetails(): void {
    this.showResponseDetails = false;
    this.selectedRequest = null;
  }

  sendResponse(selectedRequest:any): void {
    console.log(selectedRequest);
    if (!selectedRequest) {
      alert('Vui lòng nhập nội dung phản hồi.');
      return;
    }
    const responseBody = selectedRequest.newResponseText;
    const feedbackId = selectedRequest.Feedback.Id;
  
    this.requestService.updateFeedbackResponse(feedbackId, responseBody).subscribe({
      next: () => {
        alert('Gửi phản hồi thành công!');
        this.selectedRequest.Responses = [responseBody];
        this.selectedRequest.IsResponded = true;
        this.closeResponseDetails();
        this.fetchRequests(); // Cập nhật lại danh sách yêu cầu
      },
      error: (err) => {
        console.error('Lỗi khi gửi phản hồi:', err);
        alert('Gửi phản hồi thất bại.');
      }
    });
  }
  
}
