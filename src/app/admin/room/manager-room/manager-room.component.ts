import { Component, OnInit } from '@angular/core';
import { BuildingService } from '../../../services/building/building.service';
import { RoomService } from '../../../services/room/room.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.css', '../../../app.component.css']
})
export class ManagerRoomComponent implements OnInit {
  searchText: string = '';
  rooms: any[] = []; // Dữ liệu từ API
  filteredRoomsList: any[] = []; // Danh sách sau khi lọc
  isAddModalOpen: boolean = false;
  buildings: any[] = []; // Dữ liệu từ API
  filteredBuildingsList: any[] = [];
  newRoom = {
    IdRoom: null,
    IdBuilding: null,
    RoomName: null,
    NumberOfBed: null,
    Status: 0,
    Gender: 0,
    DailyPrice: 0,
    PriceYear: 0,
    DateOfRecord:null,
  };
  selectedGender: string = '';
  selectedStatus: string = ''; // Giá trị mặc định: hiển thị tất cả
  currentPage = 1;
  itemsPerPage = 20;
  totalRooms: number = 0;
  selectedBuilding: string = '';
  sortAscending: boolean = true; // Mặc định là tăng dần
  isUpdateModalOpen: boolean = false;
  newBuilding = {
    IdRoom: '',
    IdBuilding: '',
    RoomName: '',
    NumberOfBed: 0,
    Status: 0,
    Gender: 0
  };
  isLoading: boolean = false;
  editingRoomId: string = '';
  constructor(private roomService: RoomService, private buildingService: BuildingService) {}

  ngOnInit() {
    this.fetchData();
  }
  
  fetchData() {
    this.isLoading = true;
  
    forkJoin({
      buildings: this.buildingService.getBuildings(),
      rooms: this.roomService.getRooms()
    }).subscribe({
      next: (res) => {
        // Xử lý buildings
        this.buildings = res.buildings.filter(building => building.Status === 0);
        this.filteredBuildingsList = [...this.buildings];
  
        // Xử lý rooms
        this.rooms = [...res.rooms];
        this.filteredRoomsList = [...res.rooms];
        this.totalRooms = res.rooms.length;
  
        // Kết thúc loading sau khi cả 2 API xong
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        this.isLoading = false;
      }
    });
  }

  getBuildingsFromApi() {
    this.buildingService.getBuildings().subscribe({
      next: (data: any[]) => {
        this.buildings = data.filter(building => building.Status === 0);
        this.filteredBuildingsList = [...this.buildings];
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
      }
    });
  }

  getRoomsFromApi() {
    this.roomService.getRooms().subscribe({
      next: (data: any[]) => {
        this.rooms = [...data];
        this.filteredRoomsList = [...data];
        this.totalRooms = data.length;
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách phòng:', err);
      }
    });
  }

  filterRooms() {
    const searchText = this.searchText?.toLowerCase() || '';

    this.filteredRoomsList = this.rooms.filter(room => {
        const roomBuildingId = room.Building?.Id ? room.Building.Id.toString() : ''; // Lấy đúng Id của Building

        const matchesSearch = room.RoomName?.toLowerCase().includes(searchText) ||
                              roomBuildingId.includes(searchText) ||
                              room.Id?.toString().includes(searchText);

        const matchesBuilding = this.selectedBuilding === '' || roomBuildingId === this.selectedBuilding.toString();
        const matchesStatus = this.selectedStatus === '' || room.Status === this.selectedStatus;
        const matchesGender = this.selectedGender === '' || room.Gender === this.selectedGender;
        return matchesSearch && matchesBuilding && matchesStatus && matchesGender ;
    });

    this.totalRooms = this.filteredRoomsList.length;
    this.currentPage = 1;
}



addRoom(roomRegister: any) { 
  console.log(roomRegister);
  const newRooms = {
      IdBuilding: roomRegister.IdBuilding,  // Hoặc lấy từ input
      RoomName: roomRegister.RoomName, // Hoặc lấy từ input
      NumberOfBed: roomRegister.NumberOfBed, // Giá trị mặc định hoặc từ form
      Status: parseInt(roomRegister.Status), // Trạng thái phòng (1: Đang sử dụng, 0: Trống)
      Gender: parseInt(roomRegister.Gender), // 0: Nam, 1: Nữ
      DailyPrice: roomRegister.DailyPrice, // Giá theo ngày
      PriceYear: roomRegister.PriceYear, // Giá theo năm
      DateOfRecord: new Date().toISOString() // Tự động lấy thời gian hiện tại
  };

  console.log("Dữ liệu gửi lên API:", newRooms); 

  if (!newRooms.RoomName || !newRooms.IdBuilding || newRooms.NumberOfBed <= 0) { 
      alert('Vui lòng nhập đầy đủ thông tin hợp lệ!');
      return;
  }


  this.roomService.postRoom(newRooms).subscribe( 
      response => {
          alert('Thêm phòng thành công!');
          this.getRoomsFromApi();
          this.closeModals();
      },
      error => {
          alert('Có lỗi xảy ra khi thêm phòng.');
      }
  );
}


  openAddModal() {
    this.isAddModalOpen = true;
    this.isUpdateModalOpen = false;
    this.newRoom = {    
      IdRoom: null,
      IdBuilding: null,
      RoomName: null,
      NumberOfBed:null,
      Status: 0,
      Gender: 0,
      DailyPrice: 0,
      PriceYear: 0,
      DateOfRecord:null,

    }
  }

  closeModals() {
    this.isAddModalOpen = false;
    this.isUpdateModalOpen = false;
    }

  toggleRoomStatus(room: any) {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái của phòng ${room.RoomName} không?`)) return;
    const newStatus = room.Status === 0 ? 1 : 0;
    this.roomService.updateRoomStatus(room.Id, newStatus).subscribe(
      () => {
        room.Status = newStatus;
        alert("Cập nhật trạng thái thành công!");
      },
      () => {
        alert("Cập nhật trạng thái thất bại!");
      }
    );
  }
  get totalPages() {
    const total = Math.ceil(this.filteredRoomsList.length / this.itemsPerPage);
    console.log(`Total Pages: ${total}`);
    return total;
  }


  delete(room: any){
    if (!confirm(`Bạn có chắc muốn xóa phòng ${room.RoomName} không?`)) return;
    const newStatus = room.Status === 0 ? 1 : 0;
    this.roomService.deleteRoom(room.Id).subscribe(
      () => {
        room.Status = newStatus;
        alert("Xóa phòng thành công!");
        this.getRoomsFromApi();
      },
      () => {
        alert("Xóa phòng thất bại!");
      }
    );
  }
  
  openUpdateModal(room: any) {
    this.isUpdateModalOpen = true;
    this.isAddModalOpen = false;
    this.editingRoomId = room.Id;
    
    // Đảm bảo lấy đúng IdBuilding
    this.newRoom = {
      IdRoom: room.Id,
      IdBuilding: room.Building ? room.Building.Id : null, // Lấy IdBuilding từ room.Building
      RoomName: room.RoomName,
      NumberOfBed: room.NumberOfBed,
      Status: room.Status,
      Gender: room.Gender,
      DailyPrice: room,
      PriceYear: 0,
      DateOfRecord:null,
    };
}

updateRoom(newRoom:any) {
  if (!this.newRoom.IdRoom) {
      console.error("Không tìm thấy ID phòng cần cập nhật.");
      return;
  }
  newRoom.Status = Number(newRoom.Status);
  console.log("Dữ liệu gửi lên API:", JSON.stringify(newRoom));

  this.roomService.updateRoom(this.newRoom.IdRoom, this.newRoom).subscribe(
      (response) => {
          console.log("Cập nhật phòng thành công:", response);
          alert("Cập nhật phòng thành công!");
          this.closeModals();
          this.getRoomsFromApi; // Load lại danh sách phòng sau khi cập nhật
      },
      (error) => {
          console.error("Lỗi khi cập nhật phòng:", error);
          alert("Có lỗi xảy ra khi cập nhật phòng!");
      }
  );
}


  get paginatedRooms() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoomsList.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      console.log(`Next Page: ${this.currentPage}`);
    }
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      console.log(`Previous Page: ${this.currentPage}`);
    }
  }
  
  sortRoomsById() {
    this.sortAscending = !this.sortAscending; // Đảo trạng thái sắp xếp
    this.filteredRoomsList.sort((a, b) => 
        this.sortAscending ? a.IdRoom - b.IdRoom : b.IdRoom - a.IdRoom
    );
}

  
}
