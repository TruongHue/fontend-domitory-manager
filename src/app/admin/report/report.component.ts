import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ReportServiceService } from '../../services/report/report-service.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  totalRooms: number = 0;
  availableRooms: number = 0;
  occupiedRooms:number =0;
  registeredStudents = 0;
  unregisteredStudents = 0;
  totalStudents: number = 0; // Có thể fetch từ API nếu cần

  registerPeriodChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Số lượng đăng ký theo kỳ',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderRadius: 5
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          stepSize: 1, // Chỉ hiển thị số nguyên
          callback: function(value) {
            return Number.isInteger(value) ? value : null;
          }
        }
      }
    }
  };
  
  constructor(private reportService: ReportServiceService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
     this.getTotalStudents();
  this.loadRoomData();
    this.loadRegistrationData();
  
    if(this.unregisteredStudents < 0 ) this.unregisteredStudents = 0;
    this.unregisteredStudents;
  }

  loadRegistrationData(): void {
    this.reportService.getAllRegisterRoom().subscribe(
      (data: any[]) => {
        console.log("Dữ liệu từ API:", data);
        if (!data || data.length === 0) {
          console.warn('Không có dữ liệu đăng ký.');
          return;
        }

        const countByPeriod: { [key: number]: number } = {};
        let registeredStudentSet = new Set<number>();

        data.forEach(reg => {
          const period = reg.idRegistrationPeriod;
          const studentId = reg.idStudent;

          if (period !== 0) { 
            countByPeriod[period] = (countByPeriod[period] || 0) + 1;
            registeredStudentSet.add(studentId);
          }
        });

        if (Object.keys(countByPeriod).length === 0) {
          console.warn('Dữ liệu không hợp lệ hoặc toàn bộ có idRegistrationPeriod = 0');
          return;
        }

        // Cập nhật dữ liệu biểu đồ
        this.registerPeriodChartData = {
          labels: Object.keys(countByPeriod).map(key => `Kỳ ${key}`),
          datasets: [
            {
              label: 'Số lượng đăng ký theo kỳ',
              data: Object.values(countByPeriod),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderRadius: 5
            }
          ]
        };

        // Cập nhật số lượng sinh viên đăng ký
        this.registeredStudents = registeredStudentSet.size;
        this.unregisteredStudents = this.totalStudents - this.registeredStudents;
        if(this.unregisteredStudents < 0 ) this.unregisteredStudents = 0;
        console.log("Dữ liệu nhóm theo kỳ:", countByPeriod);
        console.log("Danh sách idStudent đã đăng ký:", Array.from(registeredStudentSet));
        console.log("Tổng số sinh viên đã đăng ký:", this.registeredStudents);
        console.log("Số sinh viên chưa đăng ký:", this.unregisteredStudents);

        // Cập nhật giao diện
        this.cdRef.detectChanges();
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
      }
    );
  }
  loadRoomData(): void {
    this.reportService.getAllRooms().subscribe(
      (rooms: any[]) => {
        console.log("Dữ liệu phòng từ API:", rooms);
        
        if (!rooms || rooms.length === 0) {
          console.warn("Không có dữ liệu phòng.");
          return;
        }

        // Tổng số phòng
        this.totalRooms = rooms.length;

        // Phòng trống (chưa có người ở)
        this.occupiedRooms = rooms.filter(room => room.Status === 0).length;

        // Phòng đã sử dụng
        this.availableRooms = this.totalRooms - this.occupiedRooms;


        console.log("Tổng số phòng:", this.totalRooms);
        console.log("Phòng trống:", this.availableRooms);
        console.log("Phòng đã sử dụng:", this.occupiedRooms);


        this.cdRef.detectChanges();
      },
      error => {
        console.error("Lỗi khi lấy dữ liệu phòng:", error);
      }
    );
}

  getTotalStudents(): void {
    this.reportService.getAllUsers().subscribe(users => {
      this.totalStudents = users.length; // Đếm tổng số sinh viên
    });
  }
}
