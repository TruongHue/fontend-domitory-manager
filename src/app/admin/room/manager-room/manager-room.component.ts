import { Component, OnInit } from '@angular/core';
import { BuildingService } from '../../../services/building/building.service';
import { RoomService } from '../../../services/room/room.service';

@Component({
  selector: 'app-manager-room',
  templateUrl: './manager-room.component.html',
  styleUrls: ['./manager-room.component.css']
})
export class ManagerRoomComponent implements OnInit {
  searchText: string = '';
  rooms: any[] = []; // Dữ liệu từ API
  filteredRoomsList: any[] = []; // Danh sách sau khi lọc
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;
  buildings: any[] = []; // Dữ liệu từ API
  filteredBuildingsList: any[] = [];
  newRoom = {
    roomName: '',
    idBuilding: null,
    numberOfBed: null,
    status: 0
  };
  currentPage = 1;
  itemsPerPage = 20;
  totalRooms: number = 0;
  selectedBuilding: string = '';
  sortAscending: boolean = true; // Mặc định là tăng dần

  constructor(private roomService: RoomService, private buildingService: BuildingService) {}

  ngOnInit() {
    this.getRoomsFromApi();
    this.getBuildingsFromApi();
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
    this.filteredRoomsList = this.rooms.filter(room => {
      const matchesSearch = room.RoomName.toLowerCase().includes(this.searchText.toLowerCase()) ||
                            room.IdBuilding.toString().includes(this.searchText) || 
                            room.IdRoom.toString().includes(this.searchText);
      
      const matchesBuilding = this.selectedBuilding === '' || room.IdBuilding.toString() === this.selectedBuilding;
  
      return matchesSearch && matchesBuilding;
    });
  
    this.totalRooms = this.filteredRoomsList.length;
    this.currentPage = 1;
  }
   



  addRoom() {
    if (!this.newRoom.roomName || !this.newRoom.idBuilding || !this.newRoom.numberOfBed) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    this.roomService.postRoom(this.newRoom).subscribe(
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
  }

  closeModals() {
    this.isAddModalOpen = false;
    this.isEditModalOpen = false;
    this.isDetailModalOpen = false;
  }

  toggleRoomStatus(room: any) {
    if (!confirm(`Bạn có chắc muốn đổi trạng thái của phòng ${room.RoomName} không?`)) return;
    const newStatus = room.Status === 0 ? 1 : 0;
    this.roomService.updateRoomStatus(room.IdRoom, newStatus).subscribe(
      () => {
        room.Status = newStatus;
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
