import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../services/room/room.service';
import { BuildingService } from '../../services/building/building.service';
import { ElectricityBillService } from '../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../services/bill/waterbill.service'; // ✅ Thêm service nước
import { forkJoin, ObservableInput } from 'rxjs';
import { catchError, of } from 'rxjs';
import { RegisterRoomService } from '../../services/register-room/register-room.service';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../services/user/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { RoomBillService } from '../../services/bill/room-bill.service';


interface Room {
  id: string;
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
  selector: 'app-elctricity-manager',
  templateUrl: './elctricity-manager.component.html',
  styleUrls: ['./elctricity-manager.component.css', '../../app.component.css']

})
export class ElctricityManagerComponent implements OnInit {
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
  selectedRoomBills: any = []; // Chứa thông tin hóa đơn điện nước của phòng
  latestElectricBill: any = [];
  isLoading: boolean = false;

  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private electricBill: ElectricityBillService,
    private roomBillService: RoomBillService,
    private waterBill: WaterbillService,
    private cdr: ChangeDetectorRef) { }

    ngOnInit() {
      this.isLoading = true;
      this.selectedRoomBills = null;
    
      forkJoin([
        this.getDormitoriesFromApi(),
        this.getStudentsFromApi()
      ]).subscribe({
        next: () => {
          this.isLoading = false;
          console.log('✅ Đã tải xong tòa nhà và danh sách sinh viên');
        },
        error: err => {
          console.error('Lỗi khi load dữ liệu:', err);
          this.isLoading = false;
        }
      });
    }
    
  getStudentsFromApi(): Observable<void> {
    return this.userService.getUsers().pipe(
      tap((data: any[]) => {
        this.studentsList = data.filter(student => student.Account.Roles === 0);
        this.filteredStudents = [...this.studentsList];
      }),
      map(() => {}),
      catchError(err => {
        console.error('Lỗi khi lấy danh sách sinh viên:', err);
        return of(); // để không làm fail forkJoin
      })
    );
  }
  
  getDormitoriesFromApi(): Observable<void> {
    return this.buildingService.getBuildings().pipe(
      tap((buildings: any[]) => {
        const dormitories = buildings.map(building => ({
          name: building.NameBuilding,
          rooms: []
        }));
        this.dormitories = dormitories;
      }),
      switchMap(() => this.loadRooms()),
      catchError(err => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
        return of(); // để forkJoin không bị fail
      })
    );
  }
  
  
  loadRooms(): Observable<void> {
    this.dormitories.forEach(d => d.rooms = []);
  
    return this.roomService.getRooms().pipe(
      switchMap((rooms: any[]) => {
        const allRoomTasks: Observable<void>[] = [];
  
        rooms.forEach(room => {
          const dormitory = this.dormitories.find(d => d.name === room.Building.NameBuilding);
          if (dormitory) {
            const roomData: Room = {
              id: room.Id,
              name: room.RoomName,
              totalSlots: room.NumberOfBed,
              notAvailableSlots: 0,
              status: room.Status,
              gender: room.Gender ?? 0,
              statusBill: 0
            };
  
            dormitory.rooms.push(roomData);
  
            const combinedTask$ = forkJoin([
              this.getUserCountInRoom(room.IdRoom).pipe(
                catchError(err => {
                  console.error(`Lỗi user phòng ${room.IdRoom}:`, err);
                  return of(0);
                })
              ),
              this.roomBillService.checkHasUnpaidBill(room.IdRoom).pipe(
                catchError(err => {
                  console.error(`Lỗi bill phòng ${room.IdRoom}:`, err);
                  return of({ hasUnpaidBill: false });
                })
              )
            ]).pipe(
              tap(([count, bill]) => {
                roomData.notAvailableSlots = count;
                roomData.statusBill = bill.hasUnpaidBill ? 1 : 0;
                this.cdr.detectChanges();
              }),
              map(() => {}) // Observable<void>
            );
  
            allRoomTasks.push(combinedTask$);
          }
        });
  
        // Sắp xếp phòng
        this.dormitories.forEach(dormitory => {
          dormitory.rooms.sort((a, b) => {
            const numA = parseInt(a.name.replace(/\D/g, ''), 10);
            const numB = parseInt(b.name.replace(/\D/g, ''), 10);
            return numA - numB;
          });
        });
  
        return forkJoin(allRoomTasks).pipe(map(() => {}));
      })
    );
  }
  
  openBillForm(room: any) {
    this.isLoading = true;
  
    this.selectedRoomBills = {
      id: room.id,
      name: room.name,
      dienTruoc: 0,
      ngayCuoiGhiDien: 'Chưa ghi',
      dienThangNay: 0,
      nuocTruoc: 0,
      ngayCuoiGhiNuoc: 'Chưa ghi',
      nuocThangNay: 0
    };
  
    forkJoin({
      billElectric: this.roomBillService.getlatestElectricity(room.id),
      billWater: this.roomBillService.getlatestWater(room.id)
    }).subscribe({
      next: ({ billElectric, billWater }) => {
        if (billElectric) {
          this.selectedRoomBills.dienTruoc = billElectric.AfterIndex;
          this.selectedRoomBills.ngayCuoiGhiDien = billElectric.DateOfRecord;
        }
        if (billWater) {
          this.selectedRoomBills.nuocTruoc = billWater.AfterIndex;
          this.selectedRoomBills.ngayCuoiGhiNuoc = billWater.DateOfRecord;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy hóa đơn:', err);
        this.isLoading = false; // Đảm bảo tắt loading khi lỗi
      }
    });
  }
  

  getListElectricBill(idRoom: string) {
    console.log('Gọi API với idRoom:', idRoom);
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

  getListWaterBill(idRoom: string) {
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

  getListRegisterRoom(idRoom: string) {
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

  getUserCountInRoom(idRoom: string): Observable<number> {
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

  isInvalidInput(): boolean {
    const dienThangNay = this.selectedRoomBills.dienThangNay;
    return isNaN(dienThangNay) || dienThangNay <= this.selectedRoomBills.dienTruoc;
  }
  isInvalidWaterInput(): boolean {
    const nuocThangNay = this.selectedRoomBills.nuocThangNay;
    return isNaN(nuocThangNay) || nuocThangNay <= this.selectedRoomBills.nuocTruoc;
  }
  // Hàm gọi API để lưu chỉ số điện mới
  selectElectricity(roomBill: any): void {
    if (this.isInvalidInput()) {
      alert('Chỉ số điện tháng này phải lớn hơn chỉ số điện tháng trước và phải là số nguyên.');
      return;
    }

    const requestPayload = {
      IdRoom: roomBill.id,
      AfterIndex: roomBill.dienThangNay,
      DateOfRecord: new Date().toISOString()  // Ngày ghi điện
    };

    this.roomBillService.addElectricityBill(requestPayload).subscribe(
      response => {
        alert('Thêm chỉ số điện thành công!');
        console.log('Response:', response);

        // Gọi lại API để cập nhật form ngay lập tức
        this.roomBillService.getlatestElectricity(roomBill.id).subscribe((bill) => {
          if (bill) {
            this.selectedRoomBills.dienTruoc = bill.AfterIndex;
            this.selectedRoomBills.ngayCuoiGhiDien = bill.DateOfRecord;
            this.selectedRoomBills.dienThangNay = 0; // Reset chỉ số mới
          }
        });
      },
      error => {
        alert('Có lỗi xảy ra khi thêm chỉ số điện.');
        console.error('Error:', error);
      }
    );
  }

  selectWater(roomBill: any): void {
    if (this.isInvalidWaterInput()) {
      alert('Chỉ số nước tháng này phải lớn hơn chỉ số điện tháng trước và phải là số nguyên.');
      return;
    }

    const requestPayload = {
      IdRoom: roomBill.id,
      AfterIndex: roomBill.nuocThangNay,
      DateOfRecord: new Date().toISOString()  // Ngày ghi điện
    };

    this.roomBillService.addWaterBill(requestPayload).subscribe(
      response => {
        alert('Thêm chỉ số nước thành công!');
        console.log('Response:', response);

        // Gọi lại API để cập nhật form ngay lập tức
        this.roomBillService.getlatestWater(roomBill.id).subscribe((bill) => {
          if (bill) {
            this.selectedRoomBills.nuocTruoc = bill.AfterIndex;
            this.selectedRoomBills.ngayCuoiGhiNuoc = bill.DateOfRecord;
            this.selectedRoomBills.nuocThangNay = 0; // Reset chỉ số mới
          }
        });
      },
      error => {
        alert('Có lỗi xảy ra khi thêm chỉ số điện.');
        console.error('Error:', error);
      }
    );
  }
  getUniqueFloors(dormitory: any): number[] {
    const floors: number[] = [];
    
    // Lấy tất cả các tầng từ danh sách phòng
    dormitory.rooms.forEach((room: any) => {
      const floor = this.getFloorFromRoom(room.name);  // Lấy tầng từ tên phòng
      if (!floors.includes(floor)) {
        floors.push(floor);
      }
    });
  
    return floors.sort((a, b) => a - b);  // Sắp xếp các tầng theo thứ tự
  }
  // Hàm lấy tầng từ mã phòng
getFloorFromRoom(roomName: string): number {
  // Giả sử tên phòng có dạng "P101", "P102",... thì lấy 2 ký tự sau "P"
  return parseInt(roomName.substring(1, 2), 10); // Lấy chữ số thứ 2 trong tên phòng
}

}

