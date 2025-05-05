import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../../services/room/room.service';
import { BuildingService } from '../../../services/building/building.service';
import { RegisterRoomService } from '../../../services/register-room/register-room.service';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../../../services/user/user.service';
import { ChangeDetectorRef } from '@angular/core';
import { RegistrationPeriodService } from '../../../services/registration-period/registration-period.service';

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
  selector: 'app-room-status-management',
  templateUrl: './room-status-management.component.html',
  styleUrl: './room-status-management.component.css'
})
export class RoomStatusManagementComponent implements OnInit {
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
  dormitory: any;
  studentsList: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';
  selectedStudentText: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  idRegistrationPeriodsActive: string ='';
  registrationPeriods: any =[];
  isYearly: any;
  selectedRoomDetail: any = null;
  isLoading: boolean = false;

  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private registrationService: RegistrationPeriodService) { }

  ngOnInit() {   
    this.loadRegistrationPeriods();
    this.getDormitoriesFromApi();
    this.getStudentsFromApi();
    this.calculateTotal();
    this.loadRooms();
  }

  detailRoom(data: any) {
    console.log(data.id);
    this.registerRoom.getAllRegisterRoombyIdRoomActive(data.id).subscribe(
      response => {
        this.selectedRoomDetail = {
          id: data.id,
          students: response || [] // Gán danh sách sinh viên từ API vào biến selectedRoomDetail
        };
      },
      error => {
        console.error('Lỗi khi lấy danh sách sinh viên:', error);
        // Gán giá trị mặc định khi gặp lỗi để tránh lỗi giao diện
        this.selectedRoomDetail = {
          id: data.id,
          students: []
        };
      }
    );
  }
  
  

closeDetailRoom() {
    this.selectedRoomDetail = null;
}
block(student:any) {
  if (!confirm("Bạn có chắc chắn muốn cập nhật?")) {
        return;
    }

    const updateData = { status: 1 }; // Chỉ cập nhật trạng thái

    console.log("Gửi dữ liệu:", { student, updateData });

    this.registerRoom.updateStatus(student.IdRegister, updateData).subscribe({
        next: (res) => {
            console.log("Phản hồi từ API:", res); // Debug API response
            this.detailRoom(student.IdRoom);
            alert("Cập nhật thành công!");
        },
        error: (err) => {
            console.error("Lỗi cập nhật:", err);
            alert("Cập nhật thất bại!");
        }
    });
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
  
  
  async submitRegister(data: any) {
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
  
    if (!this.idRegistrationPeriodsActive) {
      await this.loadRegistrationPeriods();
      if (!this.idRegistrationPeriodsActive) {
        alert('Không có kỳ đăng ký!');
        this.isLoading = false;
        return;
      }
    }
  
    // ✅ Thêm xác nhận
    const confirmRegister = window.confirm('Bạn có chắc chắn muốn đăng ký phòng này không?');
    if (!confirmRegister) {
      this.isLoading = false;
      return;
    }
  
    this.proceedRegister(data);
    this.ngOnInit();
    this.isLoading = false;
  }
  
  
  
  proceedRegister(data:any) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
  
    if (startDate >= endDate) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
      return;
    }
  
    const requestData = {
      idUser: data.idStudent,
      idRoom: this.selectedRoom.id,
      idRegistrationPeriod: this.idRegistrationPeriodsActive,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      total: data.total,
      paymentStatus: Number(this.registerForm.paymentStatus),
      status: 0
    };
  
    console.log('Dữ liệu gửi lên API:', requestData);
  
    this.registerRoom.createRegister(requestData).subscribe({
      next: (res) => {
        alert('Đăng ký thành công!');
        this.closeRegisterForm();
        this.loadRooms();
      },
      error: (error) => {
        const errorMessage = error.error?.message;
        alert(errorMessage);
      }
    });
  }
  
  loadRegistrationPeriods(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.registrationService.getRegistrationPeriodsActive().subscribe({
        next: (data) => {
          if (data) {
            this.registrationPeriods = data;
            this.idRegistrationPeriodsActive = data.Id;
            resolve();
          } else {
            this.idRegistrationPeriodsActive = '';
            resolve(); // vẫn resolve để kết thúc
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy kỳ đăng ký:', err);
          reject(err);
        }
      });
    });
  }
  
  loadRooms() {
    this.isLoading = true; // Bắt đầu loading
    // Gọi API lấy kỳ đăng ký đang hoạt động
    this.registrationService.getRegistrationPeriodsActive().subscribe({
      next: (period: any) => {
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
  
                if (!this.dormitory.rooms.some((r: { id: string; }) => r.id === roomData.id)) {
                  this.dormitory.rooms.push(roomData);
                }
                 
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
            this.isLoading = false; // Kết thúc loading
          },
          error: (err: any) => {
            console.error('Lỗi khi lấy danh sách phòng:', err);
            this.isLoading = false; // Kết thúc loading
          }
        });
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy kỳ đăng ký:', err);
      }
    });
  }
  


  openRegisterForm(room: any) {
    this.selectedRoom = room;
    // Gán giá phòng dựa theo loại hình đăng ký
    this.registerForm.price = room.price;
    // Reset các thông tin đăng ký
    this.registerForm.startDate = '';
    this.registerForm.endDate = '';
    this.registerForm.total = 0;
    this.registerForm.paymentStatus = 0; // Mặc định chưa thanh toán
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
  filterStudents() {
    const text = this.searchText.toLowerCase();
    this.filteredStudents = this.studentsList.filter(student =>
      student.Account.UserCode.toLowerCase().includes(text) ||
      student.Account.UserName.toLowerCase().includes(text)
    );
  }

  selectStudent(student: any) {
    console.log("Sinh viên được chọn:", student); // Kiểm tra dữ liệu

    this.registerForm.idStudent = student.InfoStudent.Id; 
    this.selectedStudentText = `${student.Account.UserCode} - ${student.Account.UserName}`;

    console.log("Giá trị registerForm sau khi chọn:", this.registerForm);
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
