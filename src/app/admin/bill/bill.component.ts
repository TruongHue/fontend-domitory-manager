import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent implements OnInit {
  activeTab: string = 'electric-bill'; // Tab mặc định là 'electric-bill'

  ngOnInit() {
    // Không cần kiểm tra localStorage ở đây vì tab mặc định đã được thiết lập
  }

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab); // Lưu trạng thái tab vào localStorage nếu muốn nhớ trạng thái
  }
}
