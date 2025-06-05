import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { RegisterRoomService } from '../../services/register-room/register-room.service';

@Component({
  selector: 'app-history-register',
  templateUrl: './history-register.component.html',
  styleUrls: ['./history-register.component.css', '../../app.component.css']

})
export class HistoryRegisterComponent implements OnInit {
  idAccount: string ='';
  idStudent: string = '';
  registers: any[] = []; // Danh sách đăng ký của người dùng
  isLoading: boolean = true;

  constructor(
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private registerService: RegisterRoomService,
  ) {}

  ngOnInit(): void {
    this.idAccount =localStorage.getItem('accountId') ?? "";
    this.getIdStudent(); 
  }

  getIdStudent() {
    this.userService.getUsersById(this.idAccount).subscribe(
      (response: any) => {
        if (response && response.InfoStudent) {
          this.idStudent = response.InfoStudent.Id;
          console.log(this.idStudent);
          this.getUserRegisters();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        this.isLoading = false; // Kết thúc loading khi có lỗi
      }
    );
  }

  getUserRegisters() {
    this.registerRoom.getRegistersByUser(this.idStudent).subscribe(
      (data: any[]) => {
        this.registers = data; // Lưu dữ liệu đăng ký
        this.isLoading = false; // Kết thúc loading khi dữ liệu đã được tải
      },
      (error) => {
        console.error('Lỗi khi lấy lịch sử đăng ký:', error);
        this.isLoading = false; // Kết thúc loading khi có lỗi
      }
    );
  }

  cancelRegisterRoom(idRegister: string) {

    if (!confirm("Bạn có chắc chắn muốn hủy đăng ký phòng ?")) {
        return;
    }
    const updateData = { statusPayment: 2 }; 
    console.log("Gửi dữ liệu:", { idRegister, updateData});
    this.registerService.updatePaymentStatus(idRegister,updateData).subscribe({
        next: (res) => {
            console.log("Phản hồi từ API:", res); 
            this.ngOnInit();
            alert("Hủy đăng ký thành công!");
        },
        error: (err) => {
            console.error("Lỗi cập nhật:", err);
            alert("Hủy đăng ký thất bại!");
        }
    });
}

}