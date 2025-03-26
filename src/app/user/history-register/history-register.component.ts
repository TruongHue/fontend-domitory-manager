import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { RegisterRoomService } from '../../services/register-room/register-room.service';

@Component({
  selector: 'app-history-register',
  templateUrl: './history-register.component.html',
  styleUrls: ['./history-register.component.css']
})
export class HistoryRegisterComponent implements OnInit {
  idAccount: number = 0;
  idStudent: number = 0;
  registers: any[] = []; // Danh sách đăng ký của người dùng

  constructor(
    private registerRoom: RegisterRoomService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.idAccount = Number(localStorage.getItem('accountId'));
    this.getIdStudent(); 
  }

  getIdStudent() {
    this.userService.getUsersById(this.idAccount).subscribe(
      (response: any) => {
        if (response && response.InfoStudent) {
          this.idStudent = response.InfoStudent.idStudent;
          this.getUserRegisters();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    );
  }

  // Lấy lịch sử đăng ký của người dùng
  getUserRegisters() {
    this.registerRoom.getRegistersByUser(this.idStudent).subscribe(
      (data: any[]) => {
        this.registers = data; // Lưu dữ liệu đăng ký
      },
      (error) => {
        console.error('Lỗi khi lấy lịch sử đăng ký:', error);
      }
    );
  }

  // Các phương thức format, và xử lý khác ở đây...
}
