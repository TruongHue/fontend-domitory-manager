import { Component, OnInit } from '@angular/core';
import { RoomBillService } from '../../../services/bill/room-bill.service';

@Component({
  selector: 'app-price-manager',
  templateUrl: './price-manager.component.html',
  styleUrls: ['./price-manager.component.css']
})
export class PriceManagerComponent implements OnInit {
  prices: any[] = [];
  isFormVisible = false; // Biến kiểm soát hiển thị form
  newPrice = {
    idPrice: 0,
    electricityPrice: 0,
    waterPrice: 0,
    waterLimit: 0,
    waterPriceOverLimit: 0
  };

  constructor(private roomBillService: RoomBillService) {}

  ngOnInit() {
    this.getPrices();
  }

  getPrices() {
    this.roomBillService.getPriceWaterElectricities().subscribe({
      next: (data) => {
        this.prices = data;
      },
      error: (err) => console.error('❌ Lỗi lấy danh sách giá:', err)
    });
  }

  submitPrice() {
    if (
      this.newPrice.electricityPrice <= 0 ||
      this.newPrice.waterPrice <= 0 ||
      this.newPrice.waterLimit <= 0 ||
      this.newPrice.waterPriceOverLimit <= 0
    ) {
      alert('⚠ Các giá trị không được nhỏ hơn 0!');
      return;
    }
  
    this.roomBillService.addOrUpdatePrice(this.newPrice).subscribe({
      next: () => {
        alert('Thêm bảng giá thành công!');
        this.getPrices();
        this.newPrice = { idPrice: 0, electricityPrice: 0, waterPrice: 0, waterLimit: 0, waterPriceOverLimit: 0 };
        this.isFormVisible = false;
      },
      error: (err) => console.error('❌ Lỗi thêm giá:', err)
    });
  }
  

  showForm() {
    this.isFormVisible = true; // Hiển thị form
  }

  hideForm() {
    this.isFormVisible = false; // Ẩn form
  }
}
