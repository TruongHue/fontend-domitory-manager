import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/room/room.service';
import { BuildingService } from '../../../services/building/building.service';
import { RegisterRoomService } from '../../../services/register-room/register-room.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../../../services/user/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { ElectricityBillService } from '../../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../../services/bill/waterbill.service';
import { RoomBillService } from '../../../services/bill/room-bill.service';

interface Room {
  id: number;
  name: string;
  totalSlots: number;
  notAvailableSlots: number;
  status: number; // Trạng thái phòng (0: hoạt động, 1: không hoạt động)
  gender: number;
  statusBill: number;
}


interface Dormitory {
  name: string;
  rooms: Room[];
}
@Component({
  selector: 'app-detail-bill',
  templateUrl: './detail-bill.component.html',
  styleUrl: './detail-bill.component.css'
})
export class DetailBillComponent implements OnInit {
  dormitories: Dormitory[] = [];
  selectedTab = 0; // Mặc định chọn tab đầu tiên
  id = null;
  selectedRoom: any = null;
  registerForm = {
    idStudent: 0,
    idRoom: 0,
    startDate: '',
    endDate: '',
    total: 0,
    paymentStatus: 0
  };
  bill: any = {}; // Hoặc khai báo kiểu dữ liệu chính xác

  studentsList: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';
  selectedStudentText: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  electricBills: any[] = [];
  waterBills: any[] = [];
  selectedRoomBills: any = null; // Chứa thông tin hóa đơn điện nước của phòng

  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private electricBill: ElectricityBillService,
    private roomBillService: RoomBillService,
    private waterBill: WaterbillService) { }

  ngOnInit() {
    this.getDormitoriesFromApi();
    this.getStudentsFromApi();
    if (this.selectedRoomBills) {
      this.loadBills();
    }
  }


  loadBills() {
    console.log('This reference:', this); // Kiểm tra this có đúng là DetailBillComponent không
    if (this.selectedRoomBills) {
      this.roomBillService.getBillByRoomId(this.selectedRoomBills.idRoom)
        .subscribe((data: any) => {
          this.electricBills = data.filter((bill: { type: string }) => bill.type === 'electricity');
          this.waterBills = data.filter((bill: { type: string }) => bill.type === 'water');
        });
    }
  }

  getDormitoriesFromApi() {
    this.buildingService.getBuildings().subscribe({
      next: (buildings: any[]) => {
        const dormitories = buildings.map(building => ({
          name: building.NameBuilding,
          rooms: []
        }));
        this.dormitories = dormitories;
        this.loadRooms();
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
      }
    });
  }

  loadRooms() {
    this.dormitories.forEach(d => d.rooms = []); // Xóa danh sách phòng trước khi load lại
    this.roomService.getRooms().subscribe({
      next: (rooms: any[]) => {
        rooms.forEach(room => {
          const dormitory = this.dormitories.find(d => d.name === room.Building.NameBuilding);
          if (dormitory) {
            // Tạo đối tượng phòng với `notAvailableSlots` = 0 trước
            const roomData: Room = {
              id: room.IdRoom,
              name: room.RoomName,
              totalSlots: room.NumberOfBed,
              notAvailableSlots: 0, // Giá trị mặc định,
              status: room.Status,
              gender: room.Gender ?? 0, // Nếu không có thì gán 0
              statusBill: 0 // Mặc định là 0, sẽ cập nhật sau
            };
            console.log(`Dữ liệu roomData sau khi xử lý:`, roomData); // 🛠 Kiểm tra object

            dormitory.rooms.push(roomData);

            // Gọi API để cập nhật số lượng user thực tế trong phòng
            this.getUserCountInRoom(room.IdRoom).subscribe({
              next: (count: number) => {
                roomData.notAvailableSlots = count; // Cập nhật lại giá trị
              },
              error: (err: any) => {
                console.error(`Lỗi khi lấy số lượng user của phòng ${room.IdRoom}:`, err);
              }
            });

            // Gọi API để kiểm tra hóa đơn của phòng
            this.roomBillService.checkHasUnpaidBill(room.IdRoom).subscribe({
              next: (res: any) => {
                roomData.statusBill = res.hasUnpaidBill ? 1 : 0; // 1: Có hóa đơn chưa thanh toán
              },
              error: (err: any) => {
                console.error(`Lỗi khi kiểm tra hóa đơn chưa thanh toán của phòng ${room.IdRoom}:`, err);
              }
            });
          }
        });

        // Sắp xếp phòng theo số phòng
        this.dormitories.forEach(dormitory => {
          dormitory.rooms.sort((a, b) => {
            const roomNumberA = parseInt(a.name.replace(/\D/g, ''), 10);
            const roomNumberB = parseInt(b.name.replace(/\D/g, ''), 10);
            return roomNumberA - roomNumberB;
          });
        });
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách phòng:', err);
      }
    });
  }



  openBillForm(idRoom: number) {
    this.getListElectricBill(idRoom);
    this.getListWaterBill(idRoom);
    this.selectedRoomBills = { idRoom }; // Hiển thị modal
    this.loadBills();
  }

  getListElectricBill(idRoom: number) {
    this.electricBill.getElectricitiesBillByIdRoom(idRoom).subscribe({
      next: (data) => {
        console.log('Danh sách hóa đơn điện:', data);
        this.electricBills = data; // Giả sử bạn có biến `electricBills` để lưu dữ liệu
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách hóa đơn điện:', err);
      }
    });
  }

  getListWaterBill(idRoom: number) {
    this.waterBill.getWaterBillByIdRoom(idRoom).subscribe({
      next: (data) => {
        console.log('Danh sách hóa đơn nước:', data);
        this.waterBills = data; // Giả sử bạn có biến `electricBills` để lưu dữ liệu
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách hóa đơn nước:', err);
      }
    });
  }



  closeBillForm() {
    this.selectedRoomBills = null; // Đóng modal
  }

  getListRegisterRoom(idRoom: number) {
    this.registerRoom.getActiveRegisterByIdRoom(idRoom).subscribe({
      next: (data: any[]) => {
        console.log(`Danh sách đăng ký active của phòng ${idRoom}:`, data);
        // Bạn có thể xử lý dữ liệu tại đây, ví dụ: hiển thị trên UI
      },
      error: (err: any) => {
        console.error(`Lỗi khi lấy danh sách đăng ký active của phòng ${idRoom}:`, err);
      }
    });
  }

  getUserCountInRoom(idRoom: number): Observable<number> {
    return this.registerRoom.getActiveRegisterByIdRoom(idRoom).pipe(
      map((data: any[]) => data.length)
    )
  }



  getRoomsByFloor(rooms: Room[], floor: number) {
    return rooms.filter(room => {
      const roomNumber = parseInt(room.name.match(/\d+/)?.[0] || "0", 10);
      return Math.floor(roomNumber / 100) === floor;
    });
  }


  getStudentsFromApi() {
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.studentsList = data.filter(student => student.Account.Roles === 0);
        this.filteredStudents = [...this.studentsList];
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách sinh viên:', err);
      }
    });
  }
  filterStudents() {
    const text = this.searchText.toLowerCase();
    this.filteredStudents = this.studentsList.filter(student =>
      student.Account.UserCode.toLowerCase().includes(text) ||
      student.Account.UserName.toLowerCase().includes(text)
    );
  }

  selectStudent(student: any) {
    console.log("Sinh viên được chọn:", student); // Kiểm tra dữ liệu

    this.registerForm.idStudent = student.InfoStudent.idStudent; 
    this.selectedStudentText = `${student.Account.UserCode} - ${student.Account.UserName}`;

    console.log("Giá trị registerForm sau khi chọn:", this.registerForm);
  }
  validateDates() {
    const startDate = new Date(this.registerForm.startDate);
    const endDate = new Date(this.registerForm.endDate);
    this.dateError = startDate >= endDate;
  }

  getBillingPeriod(dateString: string): string {
    const date = new Date(dateString);
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth(), 1);

    return `${prevMonth.getMonth() + 1}/${prevMonth.getFullYear()} - ${nextMonth.getMonth() + 1}/${nextMonth.getFullYear()}`;
  }

  payElectricBill(billId: number) {
    this.roomBillService.payElectricBill(billId).subscribe(() => {
      alert("Thanh toán hóa đơn điện thành công!");
      this.getListElectricBill(this.selectedRoomBills.idRoom);
  
      // Kiểm tra nếu vẫn còn hóa đơn chưa thanh toán
      this.roomBillService.checkHasUnpaidBill(this.selectedRoomBills.idRoom).subscribe((res: any) => {
        const room = this.dormitories.flatMap(d => d.rooms).find(r => r.id === this.selectedRoomBills.idRoom);
        if (room) {
          room.statusBill = res.hasUnpaidBill ? 1 : 0;
        }
        this.cdRef.detectChanges(); // Cập nhật UI sau khi dữ liệu đã đúng
      });
    }, error => {
      alert("Có lỗi xảy ra khi thanh toán hóa đơn điện.");
    });
  }
  
  
  payWaterBill(billId: number) {
    this.roomBillService.payWaterBill(billId).subscribe(() => {
      alert("Thanh toán hóa đơn nước thành công!");
      this.getListWaterBill(this.selectedRoomBills.idRoom);
  
      // Kiểm tra nếu vẫn còn hóa đơn chưa thanh toán
      this.roomBillService.checkHasUnpaidBill(this.selectedRoomBills.idRoom).subscribe((res: any) => {
        const room = this.dormitories.flatMap(d => d.rooms).find(r => r.id === this.selectedRoomBills.idRoom);
        if (room) {
          room.statusBill = res.hasUnpaidBill ? 1 : 0;
        }
        this.cdRef.detectChanges(); // Cập nhật UI sau khi dữ liệu đã đúng
      });
    }, error => {
      alert("Có lỗi xảy ra khi thanh toán hóa đơn điện.");
    });
  }
  
  


  deleteElectricBill(billId: number) {
    if (confirm("Bạn có chắc chắn muốn xóa hóa đơn điện này?")) {
      this.roomBillService.deleteElectricBill(billId).subscribe(() => {
        alert("Xóa hóa đơn điện thành công!");
        
        // Reload danh sách hóa đơn điện
        this.getListElectricBill(this.selectedRoomBills.idRoom);
  
        // Reload danh sách phòng
        this.loadRooms();
  
        // Cập nhật lại giao diện
        this.cdRef.detectChanges();
      }, error => {
        alert("Có lỗi xảy ra khi xóa hóa đơn điện.");
      });
    }
  }
  
  deleteWaterBill(billId: number) {
    if (confirm("Bạn có chắc chắn muốn xóa hóa đơn nước này?")) {
      this.roomBillService.deleteWaterBill(billId).subscribe(() => {
        alert("Xóa hóa đơn nước thành công!");
        
        // Reload danh sách hóa đơn nước
        this.getListWaterBill(this.selectedRoomBills.idRoom);
  
        // Reload danh sách phòng
        this.loadRooms();
  
        // Cập nhật lại giao diện
        this.cdRef.detectChanges();
      }, error => {
        alert("Có lỗi xảy ra khi xóa hóa đơn nước.");
      });
    }
  }
  

}


