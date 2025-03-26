import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
  studentsList: any[] = []; // Danh sách sinh viên từ API

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.getStudentsFromApi();
  }

  getStudentsFromApi() {
    this.userService.getUsers().subscribe({
      next: (data: any[]) => {
        this.studentsList = data.filter(student => student.Account.Roles === 0);
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách sinh viên:', err);
      }
    });
  }
  getImageUrl(picture: string): string {
    return picture ? `http://localhost:5048/images/${picture}` : 'assets/default-avatar.png';
}

}
