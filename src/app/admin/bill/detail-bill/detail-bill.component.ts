import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/room/room.service';
import { BuildingService } from '../../../services/building/building.service';
import { RegisterRoomService } from '../../../services/register-room/register-room.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../../../services/user/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { ElectricityBillService } from '../../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../../services/bill/waterbill.service';
import { RoomBillService } from '../../../services/bill/room-bill.service';
import { app } from '../../../../../server';

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
  selector: 'app-detail-bill',
  templateUrl: './detail-bill.component.html',
  styleUrls: ['./detail-bill.component.css', '../../../app.component.css']

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
  updateBill = {
    StudentCode: '',
    StudentName: ''
  }
  billType = 0;
  bill: any = {}; // Hoặc khai báo kiểu dữ liệu chính xác
  isStudentSelectionVisible = false;
  searchStudent = '';
  selectedStudent = null;
  selectedBill: any;
  studentsList: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';
  selectedStudentText: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  electricBills: any[] = [];
  waterBills: any[] = [];
  selectedRoomBills: any = null; // Chứa thông tin hóa đơn điện nước của phòng
  students: any = [];
  isLoading: boolean = false;

  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private electricBill: ElectricityBillService,
    private roomBillService: RoomBillService,
    private waterBill: WaterbillService) { }

  ngOnInit() {
    this.isLoading = true;
    forkJoin([
      this.getDormitoriesFromApi(),
    ]).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  loadpage() {
    this.getDormitoriesFromApi();
  }

  loadBills() {
    if (this.selectedRoomBills) {
      this.roomBillService.getAllBillElectricAndWaterByRoomId(this.selectedRoomBills.id)
        .subscribe((data: any) => {
          console.log(data.WaterBills);
          // Gán dữ liệu trực tiếp từ response
          this.electricBills = data.ElectricityBills;
          this.waterBills = data.WaterBills;
        });
    }
  }



  // Đóng modal chọn sinh viên
  closeStudentSelection() {
    this.isStudentSelectionVisible = false;
  }




  loadRooms(): Observable<void> {
    this.dormitories.forEach(d => d.rooms = []);
    return this.roomService.getRooms().pipe(
      switchMap((rooms: any[]) => {
        const allSubRequests: Observable<any>[] = [];

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

            const userCount$ = this.getUserCountInRoom(room.IdRoom).pipe(
              tap(count => roomData.notAvailableSlots = count),
              catchError(err => {
                console.error(`Lỗi lấy số user phòng ${room.IdRoom}:`, err);
                return of(null);
              })
            );

            const billCheck$ = this.roomBillService.checkHasUnpaidBill(room.Id).pipe(
              tap(res => roomData.statusBill = res.hasUnpaidBill ? 1 : 0),
              catchError(err => {
                console.error(`Lỗi hóa đơn phòng ${room.IdRoom}:`, err);
                return of(null);
              })
            );

            allSubRequests.push(userCount$, billCheck$);
          }
        });

        return forkJoin(allSubRequests).pipe(
          tap(() => {
            this.dormitories.forEach(dormitory => {
              dormitory.rooms.sort((a, b) => {
                const roomNumberA = parseInt(a.name.replace(/\D/g, ''), 10);
                const roomNumberB = parseInt(b.name.replace(/\D/g, ''), 10);
                return roomNumberA - roomNumberB;
              });
            });
          }),
          map(() => { }) // Trả về void
        );
      })
    );
  }
  hasUnpaidBill(dormitory: any): boolean {
    return dormitory.rooms?.some((room: any) => room.statusBill === 1);
  }

  openBillForm(room: any) {
    console.log(room);
    this.selectedRoomBills = room; // Hiển thị modal
    this.loadBills();
  }

  getListElectricBill(idRoom: string) {
    this.electricBill.getElectricitiesBillByIdRoom(idRoom).subscribe({
      next: (data) => {
        this.electricBills = data; // Giả sử bạn có biến `electricBills` để lưu dữ liệu
      },
      error: (err) => {
      }
    });
  }

  getListWaterBill(idRoom: string) {
    this.waterBill.getWaterBillByIdRoom(idRoom).subscribe({
      next: (data) => {
        this.waterBills = data;
        console.log(data);
      },
      error: (err) => {
      }
    });
  }



  closeBillForm() {
    this.selectedRoomBills = null; // Đóng modal
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


  getDormitoriesFromApi(): Observable<any> {
    this.isLoading = true;
    return this.buildingService.getBuildings().pipe(
      tap((buildings: any[]) => {
        this.dormitories = buildings.map(building => ({
          name: building.NameBuilding,
          rooms: []
        }));
      }),
      switchMap(() => this.loadRooms()),
      catchError(err => {
        this.isLoading = false;
        return of([]); // Trả về danh sách rỗng để không ảnh hưởng luồng
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  filterStudents() {
    const text = this.searchText.toLowerCase();
    this.filteredStudents = this.studentsList.filter(student =>
      student.AccountInfo.UserCode.toLowerCase().includes(text) ||
      student.AccountInfo.UserName.toLowerCase().includes(text)
    );
  }


  openStudentSelection(billType: number, bill: any) {
    this.fetchStudents(bill.IdRoom);
    this.billType = billType;
    this.isStudentSelectionVisible = true;
    this.selectedBill = bill;
  }
  fetchStudents(idRoom: string) {
    this.isLoading = true;
    this.registerRoom.fetchStudents(idRoom).subscribe(
      data => {
        this.studentsList = data;
        this.filteredStudents = data;  // Đặt giá trị ban đầu cho filteredStudents
        this.isLoading = false;
      },
      error => {
        console.error('Có lỗi khi gọi API:', error);
        this.isLoading = false;
      }
    );
  }

  selectStudent(student: any) {
    this.isLoading = true;
    this.updateBill.StudentCode = student.AccountInfo.UserCode;
    this.updateBill.StudentName = student.AccountInfo.UserName;
    const confirmSelection = confirm(`Bạn có chắc chắn chọn sinh viên ${student.AccountInfo.UserName} - ${student.AccountInfo.UserCode} thanh toán không ?`);
    if (confirmSelection) {
      if (this.billType === 1) {
        this.payElectricBill(this.selectedBill.Id, this.updateBill);
      }
      if (this.billType === 2) {
        this.payWaterBill(this.selectedBill.Id, this.updateBill);
      }
    }
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

  payElectricBill(billId: string, data: any) {
    this.roomBillService.payElectricBill(billId, data).subscribe(() => {
      alert("Thanh toán hóa đơn điện thành công!");
      this.getListElectricBill(this.selectedRoomBills.idRoom);
      this.loadBills();

      this.closeStudentSelection();
      this.ngOnInit();
      this.isLoading = false;

    }, error => {
      alert("Có lỗi xảy ra khi thanh toán hóa đơn điện.");
      this.isLoading = false;
    });
  }

  payWaterBill(billId: string, data: any) {
    console.log(billId);
    console.log(data);
    this.roomBillService.payWaterBill(billId, data).subscribe(() => {
      alert("Thanh toán hóa đơn nước thành công!");
      this.getListWaterBill(this.selectedRoomBills.idRoom);
      this.loadBills();

      this.closeStudentSelection();
      this.ngOnInit();
      this.isLoading = false;


    }, error => {
      alert("Có lỗi xảy ra khi thanh toán hóa đơn điện.");
      this.isLoading = false;

    });
  }
  deleteElectricBill(billId: string) {
    if (confirm("Bạn có chắc chắn muốn xóa hóa đơn điện này?")) {
      this.roomBillService.deleteElectricBill(billId).subscribe(() => {
        alert("Xóa hóa đơn điện thành công!");

        // Reload danh sách hóa đơn điện
        this.loadBills();
        // Tái tạo giao diện
        this.ngOnInit();
        // Cập nhật lại giao diện với cdRef
        this.cdRef.detectChanges();

      }, error => {
        alert("Có lỗi xảy ra khi xóa hóa đơn điện.");
      });
    }
  }


  deleteWaterBill(billId: string) {
    console.log(billId);
    if (confirm("Bạn có chắc chắn muốn xóa hóa đơn nước này?")) {
      this.roomBillService.deleteWaterBill(billId).subscribe(() => {
        alert("Xóa hóa đơn nước thành công!");
        this.loadBills();
        // Reload danh sách hóa đơn nước
        this.ngOnInit();
        // Cập nhật lại giao diện
        this.cdRef.detectChanges();
      }, error => {
        alert("Có lỗi xảy ra khi xóa hóa đơn nước.");
      });
    }
  }

  getUnpaidBillCount(dormitory: any): number {
    if (!dormitory || !dormitory.rooms) return 0;

    let count = 0;
    for (let room of dormitory.rooms) {
      if (room.statusBill === 1) {
        count++;
      }
    }
    return count;
  }
  // Hàm lấy tầng từ mã phòng
  getFloorFromRoom(roomName: string): number {
    // Giả sử tên phòng có dạng "P101", "P102",... thì lấy 2 ký tự sau "P"
    return parseInt(roomName.substring(1, 2), 10); // Lấy chữ số thứ 2 trong tên phòng
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


}


