import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterRoomService } from '../../services/register-room/register-room.service';
import { ElectricityBillService } from '../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../services/bill/waterbill.service';
import { RoomService } from '../../services/room/room.service';

@Component({
  selector: 'app-room-manager',
  templateUrl: './room-manager.component.html',
  styleUrls: ['./room-manager.component.css']
})
export class RoomManagerComponent implements OnInit {
  idStudent: number = 0;
  idRoom: number= 0;
  unpaidElectricBills: any[] = [];
  unpaidWaterBills: any[] = [];
  allElectricBills: any[] = [];
  allWaterBills: any[] = [];
  idRooms: any[]= [];
  nameRoom: string = '';
  building: string = '';
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private registerRoom: RegisterRoomService,
    private electricBill: ElectricityBillService,
    private waterBill: WaterbillService,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
    this.getInfoRoomUser();
  }

  loadUserInfo() {
    const accountId = Number(localStorage.getItem('accountId'));
    if (accountId) {
      this.userService.getUsersById(accountId).subscribe(
        (response) => {
          this.idStudent = response.InfoStudent.idStudent;
          this.getInfoRoomUser();
        },
        (error) => {
          console.error('❌ Lỗi khi tải thông tin người dùng:', error);
        }
      );
    }
  }

  getInfoRoomUser() {
    if (!this.idStudent) return;
  
    this.registerRoom.getRegistersByUser(this.idStudent).subscribe(
      (response: any[]) => {
        const activeRooms = response
          .filter(item => item.status === 0)
          .map(item => item.idRoom);
  
        if (activeRooms.length > 0) {
          this.idRooms = activeRooms;
          this.idRoom = this.idRooms[0]; // Lấy idRoom đầu tiên phát hiện được
          this.roomService.getRoomById(this.idRoom).subscribe(room => {
            this.nameRoom = room.RoomName;
            this.building = room.Building.NameBuilding;
            console.log('Thông tin phòng:', room);
          }, error => {
            console.error('Lỗi khi lấy phòng:', error);
          });
          
          console.log('✅ ID Room đầu tiên:', this.idRoom);
          console.log('✅ Danh sách idRoom có trạng thái active:', this.idRooms);
  
          this.getUnpaidBills();
        } else {
          console.log('⚠️ Không có phòng nào đang active.');
        }
      },
      (error) => {
        console.error('❌ Lỗi khi lấy danh sách đăng ký phòng:', error);
      }
    );
  }
  

  getUnpaidBills() {
    // Reset lại mảng trước khi thêm dữ liệu mới
    this.unpaidElectricBills = [];
    this.unpaidWaterBills = [];
    this.allElectricBills = [];
    this.allWaterBills = [];
  
    this.idRooms.forEach((roomId) => {
      // Lấy hóa đơn điện
      this.electricBill.getElectricitiesBillByIdRoom(roomId).subscribe(
        (bills) => {
          const newBills = bills.filter((bill: { Id: any; }) => !this.allElectricBills.some(existing => existing.Id === bill.Id));
          this.allElectricBills = [...this.allElectricBills, ...newBills];
  
          const unpaidElectric = newBills.filter((bill: { Status: number }) => bill.Status === 1);
          this.unpaidElectricBills = [...this.unpaidElectricBills, ...unpaidElectric];
        },
        (error) => console.error(`❌ Lỗi khi lấy hóa đơn điện cho phòng ${roomId}:`, error)
      );
  
      // Lấy hóa đơn nước
      this.waterBill.getWaterBillByIdRoom(roomId).subscribe(
        (bills) => {
          const newBills = bills.filter((bill: { Id: any; }) => !this.allWaterBills.some(existing => existing.Id === bill.Id));
          this.allWaterBills = [...this.allWaterBills, ...newBills];
  
          const unpaidWater = newBills.filter((bill: { Status: number }) => bill.Status === 1);
          this.unpaidWaterBills = [...this.unpaidWaterBills, ...unpaidWater];
        },
        (error) => console.error(`❌ Lỗi khi lấy hóa đơn nước cho phòng ${roomId}:`, error)
      );
    });
  }
  
  
}
