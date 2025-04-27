import { Component,ViewEncapsulation  } from '@angular/core';
import { PostmanagerService } from '../../services/post/postmanager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', '../../app.component.css'],
  encapsulation: ViewEncapsulation.None  // 👈 đây là điểm mấu chốt

})
export class HomeComponent {
  adminPosts: any[] = [];
  isLoading: boolean = true;

  constructor(private postService: PostmanagerService) {}

  ngOnInit(): void {
    this.getAllPost();
  }

  getAllPost(){
    this.isLoading = true; // Bắt đầu loading

    this.postService.getAllPosts().subscribe(
      (data) => {
        this.adminPosts = data.sort((a, b) => {
          return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
        });
        this.isLoading = false; // Bắt đầu loading

      },
      (err) => {
        console.error('Lỗi khi lấy bài viết:', err);
        this.isLoading = false; // Bắt đầu loading

      }
    );
  }
  }