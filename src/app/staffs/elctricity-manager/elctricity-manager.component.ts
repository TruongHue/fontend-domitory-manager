import { Component, OnInit } from '@angular/core';
import { RoomService } from '../../services/room/room.service';
import { BuildingService } from '../../services/building/building.service';
import { ElectricityBillService } from '../../services/bill/electricity-bill.service';
import { WaterbillService } from '../../services/bill/waterbill.service'; // ✅ Thêm service nước
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-elctricity-manager',
  templateUrl: './elctricity-manager.component.html',
  styleUrl: './elctricity-manager.component.css'
})
export class ElctricityManagerComponent implements OnInit {
  isAddBillModalOpen: boolean = false;
  rooms: any[] = [];
  filteredRooms: any[] = [];
  buildings: any[] = [];
  searchText: string = '';
  selectedBuilding: string = '';

  constructor(
    private roomService: RoomService,
    private buildingService: BuildingService,
    private electricityBillService: ElectricityBillService,
    private waterbillService: WaterbillService // ✅ Inject service hóa đơn nước
  ) {}

  ngOnInit() {
    this.getBuildingsFromApi();
    setTimeout(() => this.getRoomsFromApi(), 500);
  }

  filterRooms() {
    if (!this.rooms || this.rooms.length === 0) return; // Tránh lỗi khi chưa có dữ liệu

    this.filteredRooms = this.rooms.filter(room => {
        const matchesSearchText = !this.searchText || 
            room.RoomName.toLowerCase().includes(this.searchText.toLowerCase());

        const matchesBuilding = !this.selectedBuilding || 
            room.IdBuilding.toString() === this.selectedBuilding.toString(); // Chuyển về string để tránh lỗi so sánh

        return matchesSearchText && matchesBuilding;
    });
}


  // 📌 Thêm hóa đơn điện
  addElectricBill(room: any) {
    if (!this.validateBillInput(room.dienThangNay, room.dienTruoc)) return;

    const billData = {
      IdRoom: room.IdRoom,
      AfterIndex: room.dienThangNay,
      DateOfRecord: new Date().toISOString()
    };

    this.electricityBillService.addElectricBill(billData).subscribe({
      next: (response: any) => {
        console.log('Hóa đơn điện được thêm thành công:', response);
        room.ngayCuoiGhiDien = new Date().toLocaleDateString('vi-VN');
        room.dienTruoc = billData.AfterIndex;
        room.dienThangNay = null; // Reset input
        alert(`Đã lưu hóa đơn điện cho phòng ${room.RoomName}`);
      },
      error: (err: any) => {
        console.error('Lỗi khi thêm hóa đơn điện:', err);
        alert('Lưu hóa đơn điện thất bại!');
      }
    });
  }

  // 📌 Thêm hóa đơn nước
  addWaterBill(room: any) {
    if (!this.validateBillInput(room.nuocThangNay, room.nuocTruoc)) return;

    const billData = {
      IdRoom: room.IdRoom,
      AfterIndex: room.nuocThangNay,
      DateOfRecord: new Date().toISOString()
    };

    this.waterbillService.addWaterBill(billData).subscribe({
      next: (response: any) => {
        console.log('Hóa đơn nước được thêm thành công:', response);
        room.ngayCuoiGhiNuoc = new Date().toLocaleDateString('vi-VN');
        room.nuocTruoc = billData.AfterIndex;
        room.nuocThangNay = null; // Reset input
        alert(`Đã lưu hóa đơn nước cho phòng ${room.RoomName}`);
      },
      error: (err: any) => {
        console.error('Lỗi khi thêm hóa đơn nước:', err);
        alert('Lưu hóa đơn nước thất bại!');
      }
    });
  }

  // 📌 Kiểm tra dữ liệu nhập vào
  private validateBillInput(afterIndex: number, beforeIndex: number): boolean {
    if (afterIndex === null || afterIndex === undefined) {
      alert('Vui lòng nhập chỉ số!');
      return false;
    }
    if (afterIndex <= 0) {
      alert('Chỉ số phải lớn hơn 0!');
      return false;
    }
    if (afterIndex <= beforeIndex) {
      alert('Chỉ số tháng này phải lớn hơn tháng trước!');
      return false;
    }
    return true;
  }

  getBuildingsFromApi() {
    this.buildingService.getBuildings().subscribe({
      next: (data: any[]) => {
        this.buildings = data;
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
      }
    });
  }

  getRoomsFromApi() {
    this.roomService.getRooms().subscribe({
      next: (rooms: any[]) => {
        console.log('📌 Danh sách phòng từ API:', rooms);
        if (!rooms || rooms.length === 0) {
          console.error('❌ Không có phòng nào được trả về từ API.');
          return;
        }

        // Log từng IdRoom trước khi gọi API hóa đơn
        rooms.forEach(room => console.log("🔎 IdRoom:", room.IdRoom));

        const electricityRequests = rooms.map(room => 
          this.electricityBillService.getLatestElectricBill(room.IdRoom)
        );
        const waterRequests = rooms.map(room => 
          this.waterbillService.getLatestWaterBill(room.IdRoom)
        );

        console.log("⏳ Đang gọi API hóa đơn điện và nước...");
        
        forkJoin([
          forkJoin(electricityRequests).pipe(
            catchError(err => {
              console.error('❌ Lỗi lấy hóa đơn điện:', err);
              return of([]); 
            })
          ),
          forkJoin(waterRequests).pipe(
            catchError(err => {
              console.error('❌ Lỗi lấy hóa đơn nước:', err);
              return of([]); 
            })
          )
        ]).subscribe({
          next: ([electricityBillsList, waterBillsList]) => {
            console.log('✅ Danh sách hóa đơn điện:', electricityBillsList);
            console.log('✅ Danh sách hóa đơn nước:', waterBillsList);

            if (!rooms || rooms.length === 0) {
              console.error('❌ Danh sách phòng bị rỗng!');
              return;
            }

            this.rooms = rooms.map((room, index) => {
              const latestElectricBill = electricityBillsList[index] || { BeforeIndex: 0, AfterIndex: 0, DateOfRecord: null };
              const latestWaterBill = waterBillsList[index] || { BeforeIndex: 0, AfterIndex: 0, DateOfRecord: null };

              console.log(`🔍 Mapping dữ liệu phòng ID ${room.IdRoom}:`, {
                dienTruoc: latestElectricBill.AfterIndex,
                ngayCuoiGhiDien: latestElectricBill.DateOfRecord,
                nuocTruoc: latestWaterBill.AfterIndex,
                ngayCuoiGhiNuoc: latestWaterBill.DateOfRecord
              });

              const building = this.buildings.find(b => b.IdBuilding === room.IdBuilding);

              return {
                ...room,
                buildingName: building ? building.BuildingName : 'Không xác định',
                dienTruoc: latestElectricBill.AfterIndex,
                ngayCuoiGhiDien: latestElectricBill.DateOfRecord 
                  ? new Date(latestElectricBill.DateOfRecord).toLocaleDateString('vi-VN') 
                  : 'Chưa ghi',
                nuocTruoc: latestWaterBill.AfterIndex,
                ngayCuoiGhiNuoc: latestWaterBill.DateOfRecord 
                  ? new Date(latestWaterBill.DateOfRecord).toLocaleDateString('vi-VN') 
                  : 'Chưa ghi'
              };
            });

            console.log('✅ Danh sách phòng sau khi gán dữ liệu:', this.rooms);
            this.filteredRooms = [...this.rooms]; 
            console.log('✅ Danh sách phòng sau khi gán:', this.filteredRooms);
          },
          error: (err: any) => console.error('❌ Lỗi khi lấy dữ liệu hóa đơn:', err)
        });
      },
      error: (err: any) => {
        console.error('❌ Lỗi khi lấy danh sách phòng:', err);
      }
    });
}

    }

