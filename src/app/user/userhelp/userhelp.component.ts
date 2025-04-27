import { Component, OnInit } from '@angular/core';
import { PostmanagerService } from '../../services/post/postmanager.service';

@Component({
  selector: 'app-userhelp',
  templateUrl:'./userhelp.component.html',
  styleUrls: ['./userhelp.component.css', '../../app.component.css']

})
export class UserhelpComponent implements OnInit{
  idAccount : string =  '';
  data: any [] = [];
  isLoading: boolean = true;
  newSupport = {
    subject: '',
    message: ''
  };
  
  ngOnInit(): void {
    this.idAccount =localStorage.getItem('accountId') ?? "";
    this.loadHelp();
  }
  constructor(private requestService: PostmanagerService) {}

  loadHelp(){
    this.isLoading = true; // Bắt đầu loading

    this.requestService.getFeedbackById(this.idAccount).subscribe({
      next: (data: any[]) => {
        this.data = data;
        console.log(this.data);
        console.log("Lấy danh sách hỗ trợ thành công");
        this.isLoading = false; // ✅ Tắt loading khi hoàn tất
      },
      error: (err) => {
        console.error('Lỗi khi lấy yêu cầu:', err);
        this.isLoading = false; // ✅ Tắt loading khi có lỗi
      }
    });
  }
  sendSupport(){ 
    this.isLoading = true;
    const confirmSend = confirm("Bạn có chắc muốn gửi yêu cầu này không?");
    if (!confirmSend) return;
    const data ={
      "AccountId": this.idAccount,
      "Title": this.newSupport.subject,
      "Content": this.newSupport.message
        }
    this.requestService.createFeedback(data).subscribe({
      next: () => {
        alert("Gửi yêu cầu hỗ trợ thành công!");
        this.loadHelp();
        this.isLoading = false;
      },error:(err) =>{
        alert('Lỗi khi gửi yêu cầu!');
        this.isLoading = false; // ✅ Tắt loading khi có lỗi
      }
    })
  }
}
