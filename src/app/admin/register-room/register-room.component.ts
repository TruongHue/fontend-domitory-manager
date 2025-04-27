import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-room',
  templateUrl: './register-room.component.html',
  styleUrls: ['./register-room.component.css'] // sửa thành style**Urls**
})
export class RegisterRoomComponent implements OnInit {
  activeTab: string = 'registration-schedule'; // 👈 Mặc định là tab đầu tiên

  ngOnInit() {

  }

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }
}
