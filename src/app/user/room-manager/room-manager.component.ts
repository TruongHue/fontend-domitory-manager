import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterRoomService } from '../../services/register-room/register-room.service';
import { ElectricityBillService } from '../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../services/bill/waterbill.service';
import { RoomService } from '../../services/room/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-room-manager',
  templateUrl: './room-manager.component.html',
  styleUrls: ['./room-manager.component.css', '../../app.component.css']

})
export class RoomManagerComponent implements OnInit {
  idStudent: string = '';
  idRoom: string ='';
  unpaidElectricBills: any[] = [];
  unpaidWaterBills: any[] = [];
  paidElectricBills: any[] = [];
  allElectricBills: any[] = [];
  allWaterBills: any[] = [];
  paidWaterBills: any[] = [];
  idRooms: any[]= [];
  nameRoom: string = '';
  building: string = '';
  isLoading: boolean = true;

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
    //this.getInfoRoomUser();
  }

  loadUserInfo() {
    const accountId = localStorage.getItem('accountId');
    console.log(accountId);
    if (accountId) {
      this.userService.getUsersById(accountId).subscribe(
        (response) => {
          this.idStudent = response.InfoStudent.Id;
          console.log(this.idStudent);
          this.getInfoRoomUser(this.idStudent);

        },
        (error) => {
          console.error('❌ Lỗi khi tải thông tin người dùng:', error);
          this.isLoading = false; // Bắt đầu loading

        }
      );
    }
  }

  
  getInfoRoomUser(idUser: string) {
    if (!idUser) return;
  
    this.registerRoom.getRegistersByUser(idUser).subscribe(
      (response: any[]) => {
        const activeRooms = response
          .filter(item => item.Status === 0)
          .map(item => item.IdRoom);
  
        if (activeRooms.length > 0) {
          this.idRooms = activeRooms;
          this.idRoom = this.idRooms[0];
  
          this.roomService.getRoomById(this.idRoom).subscribe(room => {
            this.nameRoom = room.RoomName;
            this.building = room.Building.NameBuilding;
  
            // Sau khi có thông tin phòng, mới bắt đầu lấy hóa đơn
            this.getUnpaidBills();
          }, error => {
            console.error('Lỗi khi lấy phòng:', error);
            this.isLoading = false;
          });         
        } else {
          console.log('⚠️ Không có phòng nào đang active.');
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('❌ Lỗi khi lấy danh sách đăng ký phòng:', error);
        this.isLoading = false;
      }
    );
  }
  
  getUnpaidBills() {
    this.unpaidElectricBills = [];
    this.unpaidWaterBills = [];
    this.paidElectricBills = [];
    this.paidWaterBills = [];
    this.allElectricBills = [];
    this.allWaterBills = [];
  
    const electricBillObservables = this.idRooms.map(roomId =>
      this.electricBill.getElectricitiesBillByIdRoom(roomId)
    );
  
    const waterBillObservables = this.idRooms.map(roomId =>
      this.waterBill.getWaterBillByIdRoom(roomId)
    );
  
    forkJoin([...electricBillObservables, ...waterBillObservables]).subscribe(
      (results) => {
        const totalRooms = this.idRooms.length;
  
        // Điện
        results.slice(0, totalRooms).forEach((bills: any) => {
          const newBills = bills.filter((bill: any) =>
            !this.allElectricBills.some(existing => existing.Id === bill.Id)
          );
          this.allElectricBills.push(...newBills);
          this.paidElectricBills.push(...newBills.filter((bill: any) => bill.Status === 0));
          this.unpaidElectricBills.push(...newBills.filter((bill: any) => bill.Status === 1));
        });
  
        // Nước
        results.slice(totalRooms).forEach((bills: any) => {
          const newBills = bills.filter((bill: any) =>
            !this.allWaterBills.some(existing => existing.Id === bill.Id)
          );
          this.allWaterBills.push(...newBills);
          this.paidWaterBills.push(...newBills.filter((bill: any) => bill.Status === 0));
          this.unpaidWaterBills.push(...newBills.filter((bill: any) => bill.Status === 1));
        });
  
        // ✅ Chỉ sau khi toàn bộ dữ liệu xong thì mới ẩn loading
        this.isLoading = false;
      },
      (error) => {
        console.error('❌ Lỗi khi lấy hóa đơn:', error);
        this.isLoading = false;
      }
    );
  }
  
  
  
}
