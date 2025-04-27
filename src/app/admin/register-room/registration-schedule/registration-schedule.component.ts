import { Component, OnInit } from '@angular/core';
import { RegistrationPeriodService } from '../../../services/registration-period/registration-period.service';

@Component({
  selector: 'app-registration-schedule',
  templateUrl: './registration-schedule.component.html',
  styleUrls: ['./registration-schedule.component.css', '../../../app.component.css']
})
export class RegistrationScheduleComponent implements OnInit {
  registrationList: any[] = [];
  selectedPeriod: any = [];
  isEditing: boolean = false;
  showModal: boolean = false;
  showDeleteConfirm: boolean = false;
  filteredList: any[] = []; // Danh sách đã lọc
  selectedStatus: string = ''; // Giá trị lọc
  currentPage: number = 1;
  totalPages: number = 1;
  isLoading: boolean = false;

  constructor(private registrationService: RegistrationPeriodService) {}

  ngOnInit(): void {
    this.loadRegistrationPeriods();
    this.selectedPeriod;
  }


  
prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadRegistrationPeriods(); // Gọi API hoặc cập nhật dữ liệu tương ứng
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadRegistrationPeriods(); // Gọi API hoặc cập nhật dữ liệu tương ứng
  }
}
  // Gọi API để lấy danh sách kỳ đăng ký
  loadRegistrationPeriods(): void {
    this.isLoading = true; // Bắt đầu loading

    this.registrationService.getAllRegistrationPeriods().subscribe({
      next: (data: any[]) => {
        // Sắp xếp: Đưa những mục có Status = 0 lên đầu
        this.registrationList = data.sort((a, b) => (a.Status === 0 ? -1 : 1));
        this.filteredList = [...this.registrationList]; // Gán dữ liệu đã sắp xếp
        this.isLoading = false; // Bắt đầu loading

      },
      error: (err: any) => {
        console.error('Lỗi khi lấy dữ liệu từ API:', err);
        this.isLoading = false; // Bắt đầu loading
      }
    });
  }
  

  getStatusText(status: number): string {
    return status === 0 ? 'Đang mở' : 'Đã đóng';
  }

  getSemesterText(semesterStatus: number): string {
    return semesterStatus === 0 ? 'Kỳ hè' : 'Trong năm';
  }

  // Mở modal thêm kỳ đăng ký mới
  openAddModal(): void {
    this.isEditing = false;
    this.selectedPeriod = {
      StartDate: '',
      EndDate: '',
      SemesterStatus: 0,
      Status: 0
    };
    this.showModal = true;
  }
  formatDate(dateString: any): string {
    if (!dateString) return ''; // Tránh lỗi nếu giá trị rỗng
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Kiểm tra nếu không phải ngày hợp lệ
    return date.toISOString().split('T')[0]; // Chuyển thành yyyy-MM-dd
  }
  
  // Mở modal sửa kỳ đăng ký
  openEditModal(period: any): void {
    this.isEditing = true;
    this.selectedPeriod = {
      ...period,
      StartDate: this.formatDate(period.StartDate),
      EndDate: this.formatDate(period.EndDate)
    };
    this.showModal = true;
  }
  
  closeModal(): void {
    this.showModal = false;
  }

  openDeleteConfirm(period: any): void {
    this.selectedPeriod = period;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
  }

  saveRegistrationPeriod(): void {
    if (new Date(this.selectedPeriod.StartDate) >= new Date(this.selectedPeriod.EndDate)) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc.');
      return;
    }

    if (this.isEditing) {
      this.updateRegistrationPeriod();
    } else {
      this.addRegistrationPeriod();
    }
  }

  addRegistrationPeriod(): void {
    const newPeriod = {
      IdRegistrationPeriod: 0,
      ActionDate: new Date().toISOString(),
      StartDate: this.selectedPeriod.StartDate,
      EndDate: this.selectedPeriod.EndDate,
      SemesterStatus: Number(this.selectedPeriod.SemesterStatus),
      Status: Number(this.selectedPeriod.Status)
    };

    this.registrationService.addRegistrationPeriod(newPeriod).subscribe({
      next: (response: any) => {
        alert(response.message || 'Thêm mới kỳ đăng ký thành công!');
        this.loadRegistrationPeriods();
        this.closeModal();
      },
      error: (err: any) => {
        console.error('Lỗi khi thêm kỳ đăng ký:', err);
        alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    });
  }

  updateRegistrationPeriod(): void {
    const updatedPeriod = {
      ...this.selectedPeriod,
      SemesterStatus: Number(this.selectedPeriod.SemesterStatus), // Đảm bảo kiểu number
      Status: Number(this.selectedPeriod.Status) // Đảm bảo kiểu number
    };
  console.log(updatedPeriod);

    this.registrationService.updateRegistrationPeriod(updatedPeriod.Id, updatedPeriod)
      .subscribe({
        next: (response: any) => {
          alert(response.message || 'Cập nhật kỳ đăng ký thành công!');
          this.loadRegistrationPeriods();
          this.closeModal();
        },
        error: (err: any) => {
          console.error('Lỗi khi cập nhật kỳ đăng ký:', err);
          alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
        }
      });
  }
  

  deleteRegistrationPeriod(id: string): void {
    this.registrationService.deleteRegistrationPeriod(id).subscribe({
      next: (response: any) => {
        alert(response.message || 'Xóa thành công!');
        this.loadRegistrationPeriods();
        this.closeDeleteConfirm();
      },
      error: (err: any) => {
        console.error('Lỗi khi xóa kỳ đăng ký:', err);
        alert(err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    });
  }
  toggleRegistrationStatus(registration: any): void {
    const confirmChange = confirm(`Bạn có chắc muốn đổi trạng thái không?`);
    if (!confirmChange) return;
  
    const newStatus = {
      IdRegistrationPeriod: registration.Id, // Giả sử registration có Id
      Status: registration.Status === 0 ? 1 : 0 // Đảo trạng thái
    };
    console.log("Dữ liệu gửi đi:", newStatus);

    this.registrationService.updateRegistrationStatusPeriod(registration.Id, newStatus).subscribe(
      (response) => {
        alert(response.message); // Hiển thị thông báo cập nhật thành công
        registration.Status = newStatus; // Cập nhật trạng thái ngay trên UI
      },  
      (error) => {
        alert("Cập nhật trạng thái thất bại!");
      }
    );
  }
  
}
