import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';import { BillComponent } from './admin/bill/bill.component';
import { RoomComponent } from './admin/room/room.component';
import { HelpComponent } from './admin/help/help.component';
import { ReportComponent } from './admin/report/report.component';
import { ManagerBuildingComponent } from './admin/room/manager-building/manager-building.component';
import { ManagerRoomComponent } from './admin/room/manager-room/manager-room.component';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { RegisterRoomComponent } from './admin/register-room/register-room.component';
import { RoomStatusManagementComponent } from './admin/register-room/room-status-management/room-status-management.component';
import { ListManagementComponent } from './admin/register-room/list-management/list-management.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ManagementTotalBillComponent } from './admin/bill/management-total-bill/management-total-bill.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './user/home/home.component';
import { PersonalComponent } from './user/personal/personal.component';
import { RegisterRoomUserComponent } from './user/register-room-user/register-room-user.component';
import { HistoryRegisterComponent } from './user/history-register/history-register.component';
import { RoomManagerComponent } from './user/room-manager/room-manager.component';
import { ElctricityManagerComponent } from './staffs/elctricity-manager/elctricity-manager.component';
import { StaffsComponent } from './staffs/staffs.component';
import { HelpManagerComponent } from './staffs/help-manager/help-manager.component';
import { WaterManagerComponent } from './staffs/water-manager/water-manager.component';
import { StaffComponent } from './admin/staff/staff.component';
import { NgChartsModule } from 'ng2-charts';
import { ElctricityBillComponent } from './admin/bill/elctricity-bill/elctricity-bill.component';
import { PriceManagerComponent } from './admin/bill/price-manager/price-manager.component';
import { RegistrationScheduleComponent } from './admin/register-room/registration-schedule/registration-schedule.component';
import { AccountComponent } from './admin/account/account.component';
import { AccountInactiveComponent } from './admin/account/account-inactive/account-inactive.component';
import { AccountListComponent } from './admin/account/account-list/account-list.component';
import { AccountBlockedComponent } from './admin/account/account-blocked/account-blocked.component';
import { DetailBillComponent } from './admin/bill/detail-bill/detail-bill.component';
import { PriceWaterElectricitiesComponent } from './admin/bill/price-water-electricities/price-water-electricities.component';
import { CommonModule } from '@angular/common';
import { UserhelpComponent } from './user/userhelp/userhelp.component';
import { PostComponent } from './admin/post/post.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';  // Import CKEditorModule
import { QuillModule } from 'ngx-quill';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    DashboardComponent,
    StaffComponent,
    LoginComponent,
    RegisterComponent,
    StaffComponent,
    DashboardComponent,
    BillComponent,
    RoomComponent,
    HelpComponent,
    ReportComponent,
    ManagerBuildingComponent,
    ManagerRoomComponent,
    RegisterRoomComponent,
    RoomStatusManagementComponent,
    ListManagementComponent,
    ManagementTotalBillComponent,
    UnauthorizedComponent,
    UserComponent,
    HomeComponent,
    PersonalComponent,
    RegisterRoomUserComponent,
    HistoryRegisterComponent,
    RoomManagerComponent,
    ElctricityManagerComponent,
    StaffsComponent,
    HelpManagerComponent,
    WaterManagerComponent,
    ElctricityBillComponent,
    PriceManagerComponent,
    RegistrationScheduleComponent,
    AccountComponent,
    AccountInactiveComponent,
    AccountListComponent,
    AccountBlockedComponent,
    DetailBillComponent,
    PriceWaterElectricitiesComponent,
    UserhelpComponent,
    PostComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    NgxPaginationModule,
    MatTabsModule,
    NgChartsModule,
    CommonModule, // ✅ Đảm bảo đã import
    AngularEditorModule,
    CKEditorModule,
    QuillModule.forRoot(), 
    BrowserAnimationsModule, // bắt buộc cho toastr hoạt động
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
