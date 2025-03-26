import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminComponent } from './admin/admin.component';
import { StudentComponent } from './admin/student/student.component';
import { BillComponent } from './admin/bill/bill.component';
import { RoomComponent } from './admin/room/room.component';
import { HelpComponent } from './admin/help/help.component';
import { ReportComponent } from './admin/report/report.component';
import { StaffComponent } from './admin/staff/staff.component';
import { ManagerRoomComponent } from './admin/room/manager-room/manager-room.component';
import { RegisterRoomComponent } from './admin/register-room/register-room.component';
import { authGuard } from './guards/auth.guard'; // Import AuthGuard
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './user/home/home.component';
import { PersonalComponent } from './user/personal/personal.component';
import { RegisterRoomUserComponent } from './user/register-room-user/register-room-user.component';
import { HistoryRegisterComponent } from './user/history-register/history-register.component';
import { RoomManagerComponent } from './user/room-manager/room-manager.component';
import { HelpManagerComponent } from './staffs/help-manager/help-manager.component';
import { WaterManagerComponent } from './staffs/water-manager/water-manager.component';
import { ElctricityManagerComponent } from './staffs/elctricity-manager/elctricity-manager.component';
import { StaffsComponent } from './staffs/staffs.component';
import { AccountComponent } from './admin/account/account.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'user',component: UserComponent,
    canActivate: [authGuard], // Áp dụng AuthGuard
    data: { role: '0' },
    children: [
      {path : 'home', component: HomeComponent},
      {path :'personal', component: PersonalComponent},
      {path :'report', component: ReportComponent},
      {path: 'help', component:HelpComponent},
      {path: 'registerRoomUser', component:RegisterRoomUserComponent},
      {path: 'historyRegister', component:HistoryRegisterComponent},
      {path: 'roomManager', component:RoomManagerComponent}


    ]
  },
  { path: 'staffs',component: StaffsComponent,
    canActivate: [authGuard], // Áp dụng AuthGuard
    data: { role: '2' },
    children: [
      {path : 'electricity-managerment', component: ElctricityManagerComponent},
      {path :'water-managerment', component: WaterManagerComponent},
      {path: 'help', component:HelpManagerComponent},
    ]
  },
  // Route Admin: Bảo vệ bằng AuthGuard
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard], // Áp dụng AuthGuard
    data: { role: '1' }, // Chỉ Admin mới vào được
    children: [
      { path: 'students', component: StudentComponent },
      { path: 'staffs', component: StaffComponent },
      { path: 'bills', component: BillComponent },
      { path: 'rooms', component: RoomComponent },
      { path: 'helps', component: HelpComponent },
      { path: 'reports', component: ReportComponent },
      { path: 'manager-room', component: ManagerRoomComponent },
      { path: 'register-room', component: RegisterRoomComponent },
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      {path: 'account', component: AccountComponent}
    ]
  },

  // Trang lỗi không có quyền
  { path: 'unauthorized', component: UnauthorizedComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
