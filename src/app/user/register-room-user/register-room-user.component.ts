import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, first, map } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room/room.service';
import { BuildingService } from '../../services/building/building.service';
import { UserService } from '../../services/user/user.service';
import { RegisterRoomService } from '../../services/register-room/register-room.service';
import { RegistrationPeriodService } from '../../services/registration-period/registration-period.service';
import { RoomBillService } from '../../services/bill/room-bill.service';
import { response } from 'express';
import { formatDate } from '@angular/common';


interface Room {
  id: string;
  name: string;
  totalSlots: number;
  notAvailableSlots: number;
  status: number; // Trạng thái phòng (0: hoạt động, 1: không hoạt động)
  gender: number;
  price: number;
  statusBuilding: number;
}


interface Dormitory {
  name: string;
  rooms: Room[];
}
@Component({
  selector: 'app-register-room-user',
  templateUrl: './register-room-user.component.html',
  styleUrls: ['./register-room-user.component.css', '../../app.component.css']

})
export class RegisterRoomUserComponent implements OnInit {
  dormitories: Dormitory[] = [];
  selectedTab = 0; // Mặc định chọn tab đầu tiên
  id = null;
  selectedRoom: any = null;
  registerForm = {
    idStudent: '',
    idRoom: 0,
    startDate: '',
    endDate: '',
    total: 0,
    paymentStatus: 0,
    price:0
  };
  isSummerSemester:any;
  isLoading: boolean = false;

  startDateOfPeriod: string = '';
  endDateOfPeriod: string ='';
  dormitory: any;
  studentsList: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';
  selectedStudentText: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  idRegistrationPeriodsActive: string ='';
  registrationPeriods: any =[];
  value : number = 0;
  isYearly: any;
  idAccount: string= '';
  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private registrationService: RegistrationPeriodService) { }

  ngOnInit() {
    this.loadRegistrationPeriods();
    this.getIdStudent();  
    this.getDormitoriesFromApi();
    this.getStudentsFromApi();
    this.calculateTotal();
    this.loadRooms();
  }
  detailRoom(room:string){

  }

  getIdStudent() {
    this.isLoading = true; // Bắt đầu loading
    this.idAccount =localStorage.getItem('accountId') ?? "";
    this.userService.getUsersById(this.idAccount).subscribe(
      (response: any) => {
        if (response && response.InfoStudent) {
          this.registerForm.idStudent = response.InfoStudent.Id;
          console.log(this.registerForm.idStudent);
          this.isLoading = false; // Bắt đầu loading
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        this.isLoading = true; // Bắt đầu loading 
      }
    );
  }

  getDormitoriesFromApi() {
    this.buildingService.getBuildings().subscribe({
      next: (buildings: any[]) => {
        const dormitories = buildings.map(building => ({
          name: building.NameBuilding,
          rooms: []
        }));
        this.dormitories = dormitories;
        //this.loadRooms();
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
      }
    });
  }
  async submitRegister(data:any) {
    this.isLoading = true;

    if (!this.registerForm.idStudent) {
      alert('Vui lòng chọn sinh viên!');
      this.isLoading = false;
      return;
    }
    if (!this.registerForm.startDate) {
      alert('Vui lòng chọn ngày bắt đầu!');
      this.isLoading = false;
      return;
    }
    if (!this.registerForm.endDate) {
      alert('Vui lòng chọn ngày kết thúc!');
      this.isLoading = false;
      return;
    }
    // ✅ Thêm xác nhận
    const confirmRegister = window.confirm('Bạn có chắc chắn muốn đăng ký phòng này không?');
    if (!confirmRegister) {
      this.isLoading = false;
      return;
    }
  
    this.proceedRegister(data);
    this.closeRegisterForm();
    this.ngOnInit();
    this.isLoading = false;
  }
  
  proceedRegister(data:any) {
    this.isLoading = true;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
  
    if (startDate >= endDate) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
      return;
    }
  
    const requestData = {
      idUser: this.registerForm.idStudent,
      idRoom: this.selectedRoom.id,
      idRegistrationPeriod: this.idRegistrationPeriodsActive,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      total: data.total,
      paymentStatus:1,
      status: 0
    };
  
    console.log('Dữ liệu gửi lên API:', requestData);
  
    this.registerRoom.createRegister(requestData).subscribe({
      next: (res) => {
        alert('Đăng ký thành công!');
        this.closeRegisterForm();
        window.location.reload();
        this.loadRooms();
        this.isLoading = false;
      },
      error: (error) => {
        const errorMessage = error.error?.message;
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }
  
  loadRegistrationPeriods(): void {
    this.registrationService.getRegistrationPeriodsActive().subscribe({
      next: (data) => {
        if (data) {
          this.registrationPeriods = data;
          this.idRegistrationPeriodsActive = data.Id;
          this.value = 1;
          console.log(this.idRegistrationPeriodsActive);
        } 
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy kỳ đăng ký:', err);
        this.value = 0;
      }
    });
  }

  loadRooms() {
    this.isLoading = true; // Bắt đầu loading

    // Gọi API lấy kỳ đăng ký đang hoạt động
    this.registrationService.getRegistrationPeriodsActive().subscribe({
      next: (period: any) => {
        this.startDateOfPeriod = formatDate(period.StartDate, 'yyyy-MM-dd', 'en-US');
        console.log(this.startDateOfPeriod);
        this.startDateOfPeriod = formatDate(period.StartDate, 'yyyy-MM-dd', 'en-US');
        console.log(this.endDateOfPeriod);

        // Xác định loại giá dựa trên SemesterStatus
        this.isYearly = period.SemesterStatus;
        console.log(this.isYearly);
        this.idRegistrationPeriodsActive = period.id;
        // Gọi API lấy danh sách phòng
        this.roomService.getRooms().subscribe({
          next: (rooms: any[]) => {
            rooms.forEach(room => {
              this.dormitory = this.dormitories.find(d => d.name === room.Building.NameBuilding);
              if (this.dormitory) {
                // Chọn giá theo kỳ đăng ký
                const price = this.isYearly ? room.RoomBills?.[0]?.PriceYear ?? 0 : room.RoomBills?.[0]?.DailyPrice ?? 0;
  
                // Tạo đối tượng phòng
                const roomData: Room = {
                  id: room.Id,
                  name: room.RoomName,
                  totalSlots: room.NumberOfBed,
                  notAvailableSlots: room.NumberOfRegistrations, // Giá trị mặc định
                  status: room.Status,
                  gender: room.Gender ?? 0,
                  price: price,
                  statusBuilding: room.Building.Status
                }; 
                console.log(`Dữ liệu roomData sau khi xử lý:`, roomData); // 🛠 Kiểm tra object
  
                this.dormitory.rooms.push(roomData);
  
                // Gọi API cập nhật số lượng user thực tế trong phòng
               
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
        this.isLoading = false; // Bắt đầu loading

      },
      error: (err: any) => {
        console.error('Lỗi khi lấy kỳ đăng ký:', err);
        this.isLoading = false; // Bắt đầu loading

      }
    });
  }
  


  openRegisterForm(room: any) {
    this.selectedRoom = room;
  this.isSummerSemester = this.registrationPeriods.SemesterStatus === 0;
    // Gán giá phòng
    this.registerForm.price = room.price;
      this.registerForm.startDate = this.registrationPeriods.StartDate.substring(0, 10);
      this.registerForm.endDate = this.registrationPeriods.EndDate.substring(0, 10);  
    // Nếu là kỳ đăng ký theo năm thì gán ngày và tổng tiền
    if (this.isYearly === 1) {
      this.registerForm.total = room.price;

    } else {
const start = new Date(this.registerForm.startDate);
const end = new Date(this.registerForm.endDate);
if (start <= end) {
  const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  this.registerForm.total = this.registerForm.price * diffDays;
} else {
  this.registerForm.total = 0;
}
    }
  
    this.registerForm.paymentStatus = 0;
  }
  
  
  

  closeRegisterForm() {
    this.selectedRoom = null;
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


  validateDates() {
    const startDate = new Date(this.registerForm.startDate);
    const endDate = new Date(this.registerForm.endDate);
    this.dateError = startDate >= endDate;
  }

  calculateTotal() {

    if (this.registerForm.startDate && this.registerForm.endDate) {
        const start = new Date(this.registerForm.startDate);
        const end = new Date(this.registerForm.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

        if (this.isYearly === 1) {
            // Nếu là đăng ký theo năm, giá cố định
            this.registerForm.total = this.registerForm.price;
        } else {
            // Nếu không phải theo năm, nhân giá theo số ngày
            this.registerForm.total = this.registerForm.price * days;
        }
    }
}

// Trong component TypeScript
getRoomStats(dormitory: any): { rooms: string, beds: string } {
  let totalRooms = 0;
  let availableRooms = 0;
  let totalBeds = 0;
  let availableBeds = 0;

  dormitory.rooms.forEach((room: { totalSlots: number; notAvailableSlots: number; status: number; }) => {
    totalRooms++;
    totalBeds += room.totalSlots;

    if (room.notAvailableSlots < room.totalSlots && room.status !== 1) {
      availableRooms++;  // Tính số phòng còn trống
      availableBeds += (room.totalSlots - room.notAvailableSlots);  // Tính số giường trống
    }
  });

  return {
    rooms: `${availableRooms}/${totalRooms}`,  // Trả về dạng "12/30 phòng"
    beds: `${availableBeds}/${totalBeds}`     // Trả về dạng "32/33 giường"
  };
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

