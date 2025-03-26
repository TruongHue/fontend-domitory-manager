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
  id: number;
  name: string;
  totalSlots: number;
  notAvailableSlots: number;
  status: number; // Trạng thái phòng (0: hoạt động, 1: không hoạt động)
  gender: number;
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
    idStudent: 0,
    idRoom: 0,
    startDate: '',
    endDate: '',
    total: 0,
    paymentStatus: 0
  };
  studentsList: any[] = [];
  filteredStudents: any[] = [];
  searchText: string = '';
  selectedStudentText: string = '';
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  idRegistrationPeriodsActive: number = 0;
  registrationPeriods: any =[];
  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private registrationService: RegistrationPeriodService) { }

  ngOnInit() {
    this.getDormitoriesFromApi();
    this.getStudentsFromApi();
    this.loadRegistrationPeriods();
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
  submitRegister() {
    if (!this.registerForm.idStudent) {
      alert('Vui lòng chọn sinh viên!');
      return;
    }
    if (!this.registerForm.startDate) {
      alert('Vui lòng chọn ngày bắt đầu!');
      return;
    }
    if (!this.registerForm.endDate) {
      alert('Vui lòng chọn ngày kết thúc!');
      return;
    }
    const startDate = new Date(this.registerForm.startDate);
    const endDate = new Date(this.registerForm.endDate);

    if (startDate >= endDate) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
      return;
    }

    const requestData = {
      idStudent: Number(this.registerForm.idStudent), // Chuyển về số nguyên
      idRoom: this.selectedRoom.id, // Lấy ID phòng từ `selectedRoom`
      idRegistrationPeriod: this.idRegistrationPeriodsActive,
      startDate: new Date(this.registerForm.startDate).toISOString(),
      endDate: new Date(this.registerForm.endDate).toISOString(),
      total: this.registerForm.total,
      paymentStatus: Number(this.registerForm.paymentStatus), // Chuyển về số nguyên
      status: 0
    };

    console.log('Dữ liệu gửi lên API:', requestData);

    this.registerRoom.createRegister(requestData).subscribe({
      next: (res) => {
        alert('Đăng ký thành công!');
        this.closeRegisterForm();
        window.location.reload();

        this.loadRooms(); // Cập nhật danh sách phòng
      },
      error: (error) => {
        const errorMessage = error.error?.message;
        alert(errorMessage); // Hiển thị thông báo lỗi từ backend
      }
    });
  }
  loadRegistrationPeriods(): void {
    this.registrationService.getRegistrationPeriodsActive().subscribe({
      next: (data) => {
        if (data) {
          // Nếu có dữ liệu, gán vào biến và kiểm tra kỳ đăng ký
          this.registrationPeriods = data;
          this.idRegistrationPeriodsActive = data.IdRegistrationPeriod;
        } 
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy kỳ đăng ký:', err);
      }
    });
  }

  loadRooms() {
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
              gender: room.Gender ?? 0 // Nếu không có thì gán 0
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


  openRegisterForm(room: any) {
    console.log("Room selected:", room);
    this.selectedRoom = room;
    console.log("Room selected:", room);

  }

  closeRegisterForm() {
    this.selectedRoom = null;
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



}
