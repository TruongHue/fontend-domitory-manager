import { Component, OnInit } from '@angular/core';
import { RegisterRoomService } from '../../../services/register-room/register-room.service';

export interface Register {
  idRegister: string;
  idStudent: string;
  studentInfo?: {
    id: string;
    email: string;
    address?: string;
    nameParent?: string;
    parentNumberPhone?: string;
  };
  accountInfo?: {
    accountId: string;
    userName: string;
    userCode: string;
    numberPhone: string;
    roles: number;
    status: number;
  };
  RoomName: string;
  BuildingName: string;
  idRegistrationPeriod: string;
  startDate: string;
  endDate: string;
  actionDate: string;
  total: number;
  paymentStatus: number;
  status: number;
}

@Component({
  selector: 'app-list-management',
  templateUrl: './list-management.component.html',
  styleUrls: ['./list-management.component.css', '../../../app.component.css']
})
export class ListManagementComponent implements OnInit {
  registers: Register[] = [];
  filteredRegisters: Register[] = [];
  searchText: string = '';
  selectedStatus: string = 'All';
  selectedPayment: string = 'All';
  currentPage = 1;
  itemsPerPage = 20;
  totalPages: number = 1;
  isLoading: boolean = false;

  constructor(private registerService: RegisterRoomService) {}

  ngOnInit() {
    this.getRegisters();
  }


  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getRegisters();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getRegisters();
    }
  }

  getRegisters() {
    this.isLoading = true; // Bắt đầu loading
    this.registerService.getAllRegisters().subscribe({
        next: (data: any[]) => {
            this.registers = data.map(reg => ({
                idRegister: reg.IdRegister,
                idStudent: reg.IdStudent,
                studentInfo: reg.StudentInfo ? {
                    id: reg.StudentInfo.Id,
                    email: reg.StudentInfo.Email,
                    address: reg.StudentInfo.Address ?? '',
                    nameParent: reg.StudentInfo.NameParent ?? '',
                    parentNumberPhone: reg.StudentInfo.ParentNumberPhone ?? ''
                } : undefined,
                accountInfo: reg.AccountInfo ? {
                    accountId: reg.AccountInfo.AccountId,
                    userName: reg.AccountInfo.UserName,
                    userCode: reg.AccountInfo.UserCode,
                    numberPhone: reg.AccountInfo.NumberPhone,
                    roles: reg.AccountInfo.Roles,
                    status: reg.AccountInfo.Status
                } : undefined,
                RoomName: reg.RoomInfo?.RoomName ?? 'N/A',
                BuildingName: reg.BuildingInfo?.NameBuilding ?? 'N/A', // ✅ Đã sửa lỗi thiếu BuildingName
                idRegistrationPeriod: reg.IdRegistrationPeriod,
                startDate: reg.StartDate,
                endDate: reg.EndDate,
                actionDate: reg.ActionDate,
                total: reg.Total,
                paymentStatus: Number(reg.PaymentStatus),
                status: Number(reg.Status)
            }));

            this.filteredRegisters = [...this.registers];
            this.totalPages = this.getTotalPages();
            this.isLoading = false; // Kết thúc loading

        },
        error: (err) => {
            console.error("Lỗi khi lấy danh sách đăng ký:", err);
            this.isLoading = false; // Kết thúc loading
        }
    });
}


  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  filterData() {
    const searchText = this.searchText?.toLowerCase().trim() || '';

    this.filteredRegisters = this.registers.filter(reg => {
        const matchesSearch = searchText === '' || 
            reg.accountInfo?.userCode?.toLowerCase().includes(searchText) ||  
            reg.RoomName?.toString().includes(searchText) ||  
            reg.BuildingName?.toString().includes(searchText) ||  
            this.formatDate(reg.startDate)?.includes(searchText) ||  
            this.formatDate(reg.endDate)?.includes(searchText) ||  
            reg.total?.toString().includes(searchText);

        const matchesStatus = this.selectedStatus === 'All' || reg.status.toString() === this.selectedStatus;
        const matchesPayment = this.selectedPayment === 'All' || reg.paymentStatus.toString() === this.selectedPayment;

        return matchesSearch && matchesStatus && matchesPayment;
    });

    this.currentPage = 1;
    this.totalPages = this.getTotalPages();
  }

  get paginatedRegisters() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRegisters.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRegisters.length / this.itemsPerPage);
  }

  updatePaymentAndReload(idRegister: string, field: string, value: number) {

    if (!confirm("Bạn có chắc chắn muốn cập nhật?")) {
        return;
    }

    const updateData = { statusPayment: Number(value) }; // Chỉ cập nhật thanh toán

    console.log("Gửi dữ liệu:", { idRegister, updateData });

    this.registerService.updatePaymentStatus(idRegister, updateData).subscribe({
        next: (res) => {
            console.log("Phản hồi từ API:", res); // Debug API response
            this.getRegisters(); // Load lại danh sách
            alert("Cập nhật thành công!");
        },
        error: (err) => {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại!");
        }
    });
}


updateAndReload(idRegister: string, field: string, value: number) {
  if (!confirm("Bạn có chắc chắn muốn cập nhật?")) {
        return;
    }

    const updateData = { status: Number(value) }; // Chỉ cập nhật trạng thái

    console.log("Gửi dữ liệu:", { idRegister, updateData });

    this.registerService.updateStatus(idRegister, updateData).subscribe({
        next: (res) => {
            console.log("Phản hồi từ API:", res); // Debug API response
            this.getRegisters(); // Load lại danh sách
            alert("Cập nhật thành công!");
        },
        error: (err) => {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại!");
        }
    });
}
delete(idRegister: string) {
  if (!confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      return
  }

  this.registerService.deleteRegister(idRegister).subscribe({
      next: () => {
          this.getRegisters(); // Load lại danh sách sau khi xóa          
          alert("Xóa thành công!");

      },
      error: (err) => {
          console.error("Lỗi khi xóa:", err);
          alert("Xóa thất bại!");
      }
  });
}


  
}