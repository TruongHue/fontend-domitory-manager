import { Component, OnInit } from '@angular/core';
import { RegisterRoomService } from '../../../services/register-room/register-room.service';

interface Register {
  idRegister: number;
  idStudent: number;
  idRoom: number;
  startDate: string;
  endDate: string;
  total: number;
  paymentStatus: number; // 0: Chưa thanh toán, 1: Đã thanh toán
  status: number; // 0: Đang chờ, 1: Hoạt động, 2: Hủy
}

@Component({
  selector: 'app-list-management',
  templateUrl: './list-management.component.html',
  styleUrl: './list-management.component.css'
})
export class ListManagementComponent implements OnInit {
  registers: Register[] = [];
  filteredRegisters: Register[] = [];
  searchText: string = '';
  selectedStatus: string = 'All';
  selectedPayment: string = 'All';

  currentPage = 1;
  itemsPerPage = 5;

  constructor(private registerService: RegisterRoomService) {}

  ngOnInit() {
    this.getRegisters();
  }

  getRegisters() {
    this.registerService.getAllRegisters().subscribe({
      next: (data: Register[]) => {
        this.registers = data;
        this.filteredRegisters = [...data];
      },
      error: (err) => {
        console.error("Lỗi khi lấy danh sách đăng ký:", err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  getStatusText(status: number): string {
    return status === 0 ? 'Còn hạn' :
    status === 1 ? 'Hết hạn' :
    status === 2 ? 'Bị khóa' :
    status === 3 ? 'Đợi thanh toán' :
    'Không xác định'; // Trường hợp không khớp với giá
}

  getPaymentText(paymentStatus: number): string {
    return paymentStatus === 0 ? 'Đã thanh toán' :
            paymentStatus === 1 ?  'Chưa thanh toán':
            paymentStatus === 2 ?  'Hủy': 'Không xác định';
  }

  filterData() {
    this.filteredRegisters = this.registers.filter(reg =>
      (this.selectedStatus === 'All' || reg.status.toString() === this.selectedStatus) &&
      (this.selectedPayment === 'All' || reg.paymentStatus.toString() === this.selectedPayment) &&
      (this.searchText === '' || reg.idStudent.toString().includes(this.searchText))
    );
    this.currentPage = 1; // Reset về trang đầu
  }

  get paginatedRegisters() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRegisters.slice(start, start + this.itemsPerPage);
  }

  changePage(step: number) {
    const maxPage = Math.ceil(this.filteredRegisters.length / this.itemsPerPage);
    if (this.currentPage + step >= 1 && this.currentPage + step <= maxPage) {
      this.currentPage += step;
    }
  }
  getTotalPages(): number {
    return Math.ceil(this.filteredRegisters.length / this.itemsPerPage);
  }
  updatePaymentStatus(idRegister: number, newPaymentStatus: number) {
    this.registerService.updatePaymentStatus(idRegister, newPaymentStatus).subscribe({
        next: (response) => {
            alert(response.message);
            this.getRegisters(); // Load lại danh sách sau khi cập nhật
        },
        error: (err) => {
            console.error("Lỗi khi cập nhật trạng thái thanh toán:", err);
            alert("Cập nhật thất bại!");
        }
    });
}

}
