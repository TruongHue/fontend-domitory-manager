import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'] // Lưu ý: styleUrls đúng cú pháp
})
export class AccountComponent implements OnInit {
  activeTab: string = 'account-list-inactive'; // Mặc định là tab đầu tiên

  ngOnInit() {
  }
  

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab); // Lưu lại tab đã chọn vào localStorage
  }
}
