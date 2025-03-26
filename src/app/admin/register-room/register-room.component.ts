import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-room',
  templateUrl: './register-room.component.html',
  styleUrl: './register-room.component.css'
})
export class RegisterRoomComponent implements OnInit {
  activeTab: string = 'register-room';
  ngOnInit() {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      this.activeTab = savedTab;
    }
  }

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }
}
