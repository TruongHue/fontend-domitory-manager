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

interface Room {
  id: number;
  name: string;
  totalSlots: number;
  notAvailableSlots: number;
  status: number; // Trạng thái phòng (0: hoạt động, 1: không hoạt động)
  gender: number;
  price: string;
}
interface Dormitory {
  name: string;
  rooms: Room[];
}
@Component({
  selector: 'app-register-room-user',
  templateUrl: './register-room-user.component.html',
  styleUrl: './register-room-user.component.css'
})
export class RegisterRoomUserComponent implements OnInit {
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
  profile = {
    id: '',
    userCode: '',
    fullName: '',
    gender: null,
    email: '',
    phone: '',
    address: '',
    parentName: '',
    parentPhone: '',
    picture: ''
  };
  statusRegistrationPeriod: number = 1;
  activeTab: string = 'register';
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  today: string = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay (YYYY-MM-DD)
  dateError: boolean = false;
  totalDate: number = 0;
  //trang5 thao1 co1 ky2 dang98 ky1 khong6
  registrationPeriods: any = [];
  showRegistration: boolean = false;
  RegistrationPeriod: boolean = false;
  StartDate: string = '';  // Kiểu string
  EndDate: string = '';    // Kiểu string
  idStudent: number = 0;
  idAccount: number = 0;
  dateEnd: Date = new Date();
  price: number = 0;
  idRegistrationPeriodsActive: number = 0;
  constructor(private roomService: RoomService,
    private buildingService: BuildingService,
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private registrationService: RegistrationPeriodService,
    private roomBillService: RoomBillService) { }

  ngOnInit() {
    
    this.idAccount = Number(localStorage.getItem('accountId'));
    this.getIdStudent();
    this.getDormitoriesFromApi();
    this.loadRegistrationPeriods(); // Gọi phương thức để lấy kỳ đăng ký
    this.today = new Date().toISOString().split('T')[0];
    this.idStudent = Number(localStorage.getItem('idStudent'));
    // Kiểm tra xem kỳ đăng ký có hoạt động không
    this.showRegistration;

    const startDate = this.getActiveStartDate();
    const endDate = this.getActiveEndDate();

    // Nếu không phải null, ép kiểu Date sang định dạng string 'YYYY-MM-DD'
    this.StartDate = startDate ? startDate.toISOString().split('T')[0] : '';
    this.EndDate = endDate ? endDate.toISOString().split('T')[0] : '';



    // Chuyển StartDate từ chuỗi thành đối tượng Date
    const startDateObject = new Date(this.StartDate);
    const endDateObject = new Date(this.EndDate);

    this.totalDate = Math.floor((endDateObject.getTime() - startDateObject.getTime()) / (1000 * 3600 * 24)); // Sử dụng Math.floor để lấy số ngày chẵn

    // Kiểm tra sự khác biệt giữa ngày kết thúc và ngày bắt đầu
    if (startDateObject && endDateObject) {
      const daysDifference = Math.floor((endDateObject.getTime() - startDateObject.getTime()) / (1000 * 3600 * 24)); // Sử dụng Math.floor để lấy số ngày chẵn

      // Nếu số ngày hợp lệ, tính giá
      if (daysDifference > 0) {
        this.totalDate = daysDifference;
        this.price = daysDifference * Number(this.selectedRoom.price); // Tính giá phòng dựa trên số ngày
      } else {
        console.error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
        this.price = 0;  // Đặt lại giá nếu không hợp lệ
      }
    }

    this.onDateChange(); // Gọi phương thức này sau khi tính toán xong
  }

  onDateChange() {
    this.getIdStudent();
    // Chuyển StartDate và EndDate từ chuỗi thành đối tượng Date
    const startDateObject = new Date(this.StartDate);
    const endDateObject = new Date(this.EndDate);

    // Kiểm tra sự khác biệt giữa ngày kết thúc và ngày bắt đầu
    if (startDateObject && endDateObject) {
      const daysDifference = Math.floor((endDateObject.getTime() - startDateObject.getTime()) / (1000 * 3600 * 24)); // Sử dụng Math.floor để lấy số ngày chẵn

      // Nếu số ngày hợp lệ, tính giá
      if (daysDifference > 0) {
        this.totalDate = daysDifference; // Cập nhật tổng số ngày
        this.price = daysDifference * Number(this.selectedRoom.price); // Tính giá phòng dựa trên số ngày
      } else {
        console.error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
        this.price = 0;  // Đặt lại giá nếu không hợp lệ
      }
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
  submitRegister() {
    this.getIdStudent();
    if (!this.idStudent) {
      alert('Vui lòng chọn sinh viên!');
      return;
    }
    if (!this.StartDate) {
      alert('Vui lòng chọn ngày bắt đầu!');
      return;
    }
    if (!this.EndDate) {
      alert('Vui lòng chọn ngày kết thúc!');
      return;
    }
    const startDate = new Date(this.StartDate);
    const endDate = new Date(this.EndDate);

    if (startDate >= endDate) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
      return;
    }

    const requestData = {
      idStudent: this.idStudent, // Chuyển về số nguyên
      idRoom: this.selectedRoom.id, // Lấy ID phòng từ `selectedRoom`
      idRegistrationPeriod: this.idRegistrationPeriodsActive,
      startDate: new Date(this.StartDate).toISOString(),
      endDate: new Date(this.EndDate).toISOString(),
      actionDate: new Date().toISOString(), // Ngày thực hiện là ngày hiện tại
      paymentStatus:1, // Chuyển về số nguyên
      status: 3
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
  
  getIdStudent() {
    this.userService.getUsersById(this.idAccount).subscribe(
      (response: any) => {
        if (response && response.InfoStudent) {
          this.idStudent = response.InfoStudent.idStudent; 
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    );

  }
  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (rooms: any[]) => {
        rooms.forEach(room => {
          const dormitory = this.dormitories.find(d => d.name === room.Building.NameBuilding);
          if (dormitory) {
            // Tạo đối tượng roomData trước
            const roomData: Room = {
              id: room.IdRoom,
              name: room.RoomName,
              totalSlots: room.NumberOfBed,
              notAvailableSlots: 0, // Mặc định là 0
              status: room.Status,
              gender: room.Gender ?? 0,
              price: 'Đang tải...'
            };

            dormitory.rooms.push(roomData);

            // ✅ Lấy kỳ đăng ký hợp lệ (Status === 0)
            this.registrationService.getAllRegistrationPeriods().subscribe({
              next: (semesters: any[]) => {
                const activeSemester = semesters.find(s => s.Status === 0);
                if (activeSemester) {
                  console.log('Kỳ đăng ký hợp lệ:', activeSemester);

                  this.roomBillService.getBillByRoomId(room.IdRoom).subscribe({
                    next: (bill: any) => {
                      console.log(`Bill của phòng ${room.IdRoom}:`, bill);

                      roomData.price = activeSemester.SemesterStatus === 0
                        ? bill?.PriceYear ?? 'Không có giá theo năm'
                        : bill?.DailyPrice ?? 'Không có giá theo ngày';
                    },
                    error: err => {
                      roomData.price = 'Lỗi khi lấy giá phòng';
                      console.error(`Lỗi khi lấy giá phòng ${room.IdRoom}:`, err);
                    }
                  });
                } else {
                  roomData.price = 'Không có kỳ đăng ký hợp lệ';
                }
              },
              error: err => {
                roomData.price = 'Lỗi khi kiểm tra kỳ đăng ký';
                console.error('Lỗi khi kiểm tra kỳ đăng ký:', err);
              }
            });

            // Cập nhật số lượng user thực tế trong phòng
            this.getUserCountInRoom(room.IdRoom).subscribe({
              next: (count: number) => {
                roomData.notAvailableSlots = count;
              },
              error: err => {
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
    this.selectedRoom = room; // Lưu thông tin phòng được chọn trước
    this.loadUserProfile(); // Load thông tin sinh viên
    // Lấy ngày bắt đầu và ngày kết thúc
    const startDate = this.getActiveStartDate();
    const endDate = this.getActiveEndDate();
    const startDateObject = new Date(this.StartDate);
    const endDateObject = new Date(this.EndDate);
    // Nếu không phải null, ép kiểu Date sang định dạng string 'YYYY-MM-DD'
    this.StartDate = startDate ? startDate.toISOString().split('T')[0] : '';
    this.EndDate = endDate ? endDate.toISOString().split('T')[0] : '';
    this.totalDate = Math.floor((endDateObject.getTime() - startDateObject.getTime()) / (1000 * 3600 * 24));
    this.price = room.price * this.totalDate;

    if (!this.selectedRoom) {
      console.error("Lỗi: Chưa chọn phòng!");
      return;
    }

    console.log("Room selected after update:", this.selectedRoom);
  }

  closeRegisterForm() {
    this.selectedRoom = null;
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



  validateDates() {
    const startDate = new Date(this.registerForm.startDate);
    const endDate = new Date(this.registerForm.endDate);
    this.dateError = startDate >= endDate;
  }

  loadRegistrationPeriods(): void {
    this.registrationService.getRegistrationPeriodsActive().subscribe({
      next: (data) => {
        if (data) {
          // Nếu có dữ liệu, gán vào biến và kiểm tra kỳ đăng ký
          this.showRegistration = true;
          this.registrationPeriods = data;
          this.idRegistrationPeriodsActive = data.IdRegistrationPeriod;
        } else {
          // Nếu không có dữ liệu, đặt giá trị mặc định
          this.showRegistration = false;
        }
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy kỳ đăng ký:', err);
        this.showRegistration = false;
      }
    });
  }


  getActiveStartDate(): Date | null {
    return this.registrationPeriods ? new Date(this.registrationPeriods.StartDate) : null;
  }


  getActiveEndDate(): Date | null {
    return this.registrationPeriods ? new Date(this.registrationPeriods.EndDate) : null;
  }
  getActiveSemesterStatus() {
    return this.registrationPeriods.SemesterStatus;
  }




  loadUserProfile() {
    const userId = Number(localStorage.getItem('accountId'));
    if (userId) {
      this.userService.getUsersById(userId).subscribe(
        (response) => {
          this.profile.userCode = response.Account?.UserCode || 'Không có mã';
          this.profile.fullName = response.Account?.UserName || 'Không có tên';
          this.profile.gender = response.InfoStudent?.Gender || 'Không có giới tính';
          this.profile.email = response.InfoStudent?.Email || 'Không có email';
          this.profile.phone = response.Account?.NumberPhone || 'Không có SĐT';
          this.profile.address = response.InfoStudent?.Address || 'Không có địa chỉ';
          this.profile.parentName = response.InfoStudent?.NameParent || 'Không có tên phụ huynh';
          this.profile.parentPhone = response.InfoStudent?.ParentNumberPhone || 'Không có SĐT phụ huynh';
          this.profile.picture = response.InfoStudent?.Picture || 'assets/default-avatar.png';

        },
        (error) => {
          console.error('Lỗi khi tải thông tin người dùng', error);
        }
      );
    }


  }
  isRoomDisabled(price: any): boolean {
    if (!price || typeof price !== 'string') {
      return true; // Nếu giá không tồn tại hoặc không phải string, vô hiệu hóa phòng
    }
    return price.includes('Không có giá') || price.includes('Lỗi') || price.includes('Không có kỳ đăng ký hợp lệ') || price.includes('Không có giá theo ngày');
  }
  isRoomPriceValid(price: any): boolean {
    const priceNumber = Number(price); // Chuyển đổi giá trị về số
    return !isNaN(priceNumber) && priceNumber > 0; // Kiểm tra hợp lệ
  }
  
}
