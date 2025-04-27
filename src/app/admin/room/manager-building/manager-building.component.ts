import { Component } from '@angular/core';
import { BuildingService } from '../../../services/building/building.service';
import { Router } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-manager-building',
  templateUrl: './manager-building.component.html',
  styleUrls: ['./manager-building.component.css', '../../../app.component.css']
})
export class ManagerBuildingComponent {
  searchText: string = '';
  buildings: any[] = []; // Dữ liệu từ API
  filteredBuildingsList: any[] = []; // Danh sách sau khi lọc
  isAddModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isDetailModalOpen: boolean = false;  
  isUpdateModalOpen :boolean = false;
  editingBuildingId: string ='';
  newBuilding = {
    Id: null,
    NameBuilding: '',
    Description: '',
    Status: 0
  };
  isLoading: boolean = false;


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
    this.isLoading = true; // Bắt đầu loading
    this.buildingService.getBuildings().subscribe({
      next: (data: any[]) => {
        this.buildings = data;
        this.filteredBuildingsList = data; // Gán dữ liệu ban đầu
        this.isLoading = false; // Kết thúc loading

      },
      error: (err: any) => {
        console.error('Lỗi khi lấy danh sách tòa nhà:', err);
        this.isLoading = false; // Kết thúc loading
      }
    });
  }

  filterBuildings() {
    this.filteredBuildingsList = this.buildings.filter(building =>
      building.NameBuilding.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }


  openAddModal() {
    this.isAddModalOpen = true;
    this.isUpdateModalOpen = false;
    this.newBuilding = { Id: null, NameBuilding: '', Description: '', Status: 0 };
  }
  
  

  openUpdateModal(building:any){
    this.isUpdateModalOpen = true;
    this.isAddModalOpen = false;
    this.editingBuildingId = building.Id;
    this.newBuilding = { ...building }; // Copy dữ liệu cũ
    }
  closeModals() {
    this.isAddModalOpen = false;
    this.isUpdateModalOpen = false;
    this.isDetailModalOpen = false;
  }

  toggleBuildingStatus(buildings: any) {
    const confirmChange = confirm(`Bạn có chắc muốn đổi trạng thái của tòa nhà ${buildings.NameBuilding} không?`);
    if (!confirmChange) return;
  
    const newStatus = buildings.Status === 0 ? 1 : 0; // Đảo trạng thái
  
    this.buildingService.updateBuildingStatus(buildings.Id, newStatus).subscribe(
      (response) => {
        alert(response.message); // Hiển thị thông báo cập nhật thành công
        buildings.Status = newStatus; // Cập nhật trạng thái ngay trên UI
      },  
      (error) => {
        alert("Cập nhật trạng thái thất bại!");
      }
    );
  }

  updateBuilding(newBuilding:any){
    const confirmChange = confirm(`Bạn có chắc muốn sửa thông tin của tòa nhà ${newBuilding.NameBuilding} không?`);
    if (!confirmChange) return;
  
    this.buildingService.updateBuilding(newBuilding.Id, newBuilding).subscribe(
      (response) => {
        alert(response.message); // Hiển thị thông báo cập nhật thành công
        this.getBuildingsFromApi();
        this.closeModals();
      },  
      (error) => {
        alert("Cập nhật trạng thái thất bại!");
      }
    );
  }
  delete(buildings:any){
    const confirmChange = confirm(`Bạn có chắc muốn xóa tòa nhà ${buildings.NameBuilding} không?`);
    if (!confirmChange) return;
      this.buildingService.deleteBuilding(buildings.Id).subscribe(
      (response) => {
        alert(response.message); // Hiển thị thông báo cập nhật thành công
        this.getBuildingsFromApi();
      },
      (error) => {
        alert("Cập nhật trạng thái thất bại!");
      }
    )
  }
}
