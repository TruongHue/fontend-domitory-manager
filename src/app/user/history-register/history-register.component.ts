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
    private cdRef: ChangeDetectorRef
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
}