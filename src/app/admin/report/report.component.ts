import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { ReportServiceService } from '../../services/report/report-service.service';

interface StudentStats {
  TotalStudents?: number;
  TotalRegisteredStudents?: number;
  UnregisteredStudents?: number;
}


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css', '../../app.component.css']

})
export class ReportComponent implements OnInit {
  totalRooms: number = 0;
  availableRooms: number = 0;
  occupiedRooms: number = 0;
  registeredStudents = 0;
  unregisteredStudents = 0;
  totalStudents: number = 0; // Có thể fetch từ API nếu cần
  errorMessage: string = ''; // Error message variable
  isLoading: boolean = false;
  index: StudentStats = {};

  registerPeriodChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Sử dụng mảng các kỳ (Kỳ 1, Kỳ 2, ...) làm nhãn
    datasets: [
      {
        label: 'Số lượng đăng ký theo kỳ',
        data: [], // Dữ liệu số lượng đăng ký
        backgroundColor: 'rgba(54, 162, 235, 0.7)', // Màu sắc của cột
        borderColor: 'rgba(54, 162, 235, 1)', // Màu viền của cột
        borderRadius: 5, // Bo tròn các góc của cột
        hoverBackgroundColor: 'rgba(54, 162, 235, 0.9)', // Màu khi hover vào cột
        hoverBorderColor: 'rgba(54, 162, 235, 1)' // Màu viền khi hover vào cột
      }
    ]
  };
  

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Number.isInteger(value) ? value : null;
          }
        },
        beginAtZero: true
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,  // Xoay nhãn trục X 90 độ
          minRotation: 45   // Giới hạn tối thiểu xoay nhãn ở 45 độ
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.raw} sinh viên`; // Thêm đơn vị vào tooltip
          }
        }
      }
    }
  };
  
  
  constructor(private reportService: ReportServiceService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {   
     this.loadRegistrationData();
    this.loadChartByRegistrationPeriod();
    this.getTotalStudents();
    this.loadRoomData();
    if (this.unregisteredStudents < 0) this.unregisteredStudents = 0;
  }

  loadRegistrationData(): void {
    this.isLoading = true; // Bắt đầu loading
    this.reportService.getAllRegisterRoom().subscribe(
      (data: any) => {
        this.index = data;
        if (!data || data.length === 0) {
          console.warn('Không có dữ liệu đăng ký.');
          return;
        }
  
        const countByPeriod: { [key: string]: { count: number, startDate: string, endDate: string } } = {};
        let registeredStudentSet = new Set<number>();
  
        data.forEach((reg: { idRegistrationPeriod: any; idStudent: any; startDate: string; endDate: string; }) => {
          const period = reg.idRegistrationPeriod;
          const studentId = reg.idStudent;
  
          if (period !== 0) { 
            if (!countByPeriod[period]) {
              countByPeriod[period] = { count: 0, startDate: reg.startDate, endDate: reg.endDate };
            }
            countByPeriod[period].count += 1;
            registeredStudentSet.add(studentId);
          }
        });
  
        // Update chart data with start and end dates
        this.registerPeriodChartData = {
          labels: Object.keys(countByPeriod).map(key => {
            const period = countByPeriod[key];
            return `Kỳ ${key}: ${period.startDate} - ${period.endDate}`;
          }),
          datasets: [
            {
              label: 'Số lượng đăng ký theo kỳ',
              data: Object.values(countByPeriod).map(value => value.count),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderRadius: 5
            }
          ]
        };
  
        // Update student data
        this.registeredStudents = registeredStudentSet.size;
        this.unregisteredStudents = this.totalStudents - this.registeredStudents;
  
        if (this.unregisteredStudents < 0) this.unregisteredStudents = 0;
        this.index = {
          TotalStudents: this.totalStudents,
          TotalRegisteredStudents: this.registeredStudents,
          UnregisteredStudents: this.unregisteredStudents
        };
        this.cdRef.detectChanges();
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
        this.errorMessage = 'Không thể lấy dữ liệu từ API. Vui lòng thử lại sau.';
      }
    );
  }
  
  loadChartByRegistrationPeriod(): void {
    this.reportService.getAllRegistrationPeriod().subscribe(
      (periodData: any[]) => {
        console.log("Dữ liệu kỳ đăng ký:", periodData); // 👉 KIỂM TRA CHỖ NÀY
        this.generateChartData(periodData);
        this.cdRef.detectChanges();
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu biểu đồ:', error);
      }
    );
  }
  
  generateChartData(periodData: any[]): void {
    this.registerPeriodChartData = {
      labels: periodData.map(p =>
        `Kỳ: ${this.formatDate(p.StartDate)} - ${this.formatDate(p.EndDate)}`
      ),
      datasets: [
        {
          label: 'Số lượng đăng ký theo kỳ',
          data: periodData.map(p => p.StudentCount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderRadius: 5
        }
      ]
    };
    this.cdRef.detectChanges();
  }
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }
  
  

  loadRoomData(): void {
    this.isLoading = true; // Bắt đầu loading
    this.reportService.getAllRooms().subscribe(
      (rooms: any[]) => {
        if (!rooms || rooms.length === 0) {
          console.warn('Không có dữ liệu phòng.');
          return;
        }

        this.totalRooms = rooms.length;
        this.occupiedRooms = rooms.filter(room => room.Status === 0).length;
        this.availableRooms = this.totalRooms - this.occupiedRooms;

        this.cdRef.detectChanges();
        this.isLoading = false; // Bắt đầu loading
      },
      error => {
        console.error('Lỗi khi lấy dữ liệu phòng:', error);
        this.errorMessage = 'Không thể lấy dữ liệu phòng. Vui lòng thử lại sau.';
        this.isLoading = false; // Bắt đầu loading

      }
    );
  }

  getTotalStudents(): void {
    this.reportService.getAllUsers().subscribe(users => {
      this.totalStudents = users.length; // Đếm tổng số sinh viên
    });
  }
}
