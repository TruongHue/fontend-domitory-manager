import { Component } from '@angular/core';
import { BuildingService } from '../../../services/building/building.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager-building',
  templateUrl: './manager-building.component.html',
  styleUrls: ['./manager-building.component.css']
})
export class ManagerBuildingComponent {
  searchText: string = '';
  buildings: any[] = []; // Dữ liệu từ API
  filteredBuildingsList: any[] = []; // Danh sách sau khi lọc
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;  
  newBuilding = {
    NameBuilding: '',
    Description: '',
    Status: 0
  };

  constructor(private buildingService: BuildingService, private router: Router) {}

  ngOnInit() {
    this.getBuildingsFromApi();
  }

  addBuilding() {
    if (!this.newBuilding.NameBuilding || !this.newBuilding.Description) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    this.buildingService.postBuilding(this.newBuilding).subscribe(
      response => {
        console.log('Tòa nhà đã được thêm:', response);
        alert('Thêm tòa nhà thành công!');
        window.location.reload();
        //this.resetForm();
      },
      error => {
        console.error('Lỗi khi thêm phòng:', error);
        alert('Có lỗi xảy ra khi thêm phòng.');
      }
    );
  }

  getBuildingsFromApi() {
    this.buildingService.getBuildings().subscribe({
      next: (data: any[]) => {
        this.buildings = data;
        this.filteredBuildingsList = data; // Gán dữ liệu ban đầu
      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
      }
    });
  }

  filterBuildings() {
    this.filteredBuildingsList = this.buildings.filter(building =>
      building.NameBuilding.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }


  openAddModal() {
    console.log('Mở modal thêm tòa nhà');
    this.isAddModalOpen = true;
  }
  
  
  openEditModal() {
    this.isEditModalOpen = true;
  }
  
  closeModals() {
    this.isAddModalOpen = false;
    this.isEditModalOpen = false;
    this.isDetailModalOpen = false;
  }

  toggleBuildingStatus(buildings: any) {
    const confirmChange = confirm(`Bạn có chắc muốn đổi trạng thái của tòa nhà ${buildings.NameBuilding} không?`);
    if (!confirmChange) return;
  
    const newStatus = buildings.Status === 0 ? 1 : 0; // Đảo trạng thái
  
    this.buildingService.updateBuildingStatus(buildings.IdBuilding, newStatus).subscribe(
      (response) => {
        alert(response.message); // Hiển thị thông báo cập nhật thành công
        buildings.Status = newStatus; // Cập nhật trạng thái ngay trên UI
      },  
      (error) => {
        alert("Cập nhật trạng thái thất bại!");
      }
    );
  }
}
