import { Component, OnInit } from '@angular/core';
import { BuildingService } from '../../services/building/building.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  activeTab: string = 'room';

  ngOnInit() {

  }

  changeTab(tab: string) {
    this.activeTab = tab;
    localStorage.setItem('activeTab', tab);
  }
}