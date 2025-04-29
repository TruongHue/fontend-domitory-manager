import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PostmanagerService } from '../../services/post/postmanager.service';
import { Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import Quill from 'quill';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


const Link = Quill.import('formats/link') as any; // Thêm 'as any' để ép kiểu

// Kế thừa từ Link để tạo CustomLink
class CustomLink extends Link {
  static blotName = 'link'; // Cần xác định blotName
  static tagName = 'A'; // Cần xác định tagName cho thẻ HTML
  static scope = 1; // Xác định phạm vi, có thể là INLINE hoặc BLOCK

  
  static create(value: string) {
    let node = super.create(value);  // Tạo node từ Link mặc định
    node.setAttribute('target', '_blank');  // Ví dụ: Thêm thuộc tính target="_blank" cho link
    return node;
  }

  static sanitize(url: string) {
    const pattern = /^(https?:|mailto:|tel:|data:)/;
    return pattern.test(url) ? url : `http://${url}`;
  }
}

// Đăng ký CustomLink vào Quill
Quill.register('formats/link', CustomLink);
interface AngularEditorConfigs extends AngularEditorConfig {
  toolbar: any[];
  toolbarCustomButtons?: any[];  // Thêm thuộc tính toolbarCustomButtons
}
export interface PostModel {
  Id: string;
  Title: string;
  Content: string;
  PostDate: Date;
}

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css', '../../app.component.css'],
  encapsulation: ViewEncapsulation.None  // 👈 đây là điểm mấu chốt
})
export class PostComponent implements OnInit {
  posts: PostModel[] = [];
  selectedPost: PostModel | null = null;
  showModal = false;
  toolbar: any[] = [];  
  isLoading: boolean = false;
  newPost = {
  Title: '',
  Content: ''
};
sanitizedContent: SafeHtml | null = null;



editorConfig: AngularEditorConfigs = {
  editable: true,
  spellcheck: true,
  height: '200px',
  minHeight: '0',
  placeholder: 'Nhập nội dung bài viết...',
  translate: 'no',
  defaultParagraphSeparator: 'p',
  defaultFontName: 'Arial',
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link'],
    [{ 'align': [] }],
    ['clean']
  ]
};


  constructor(private postService: PostmanagerService, private router: Router,    private sanitizer: DomSanitizer // 👉 thêm dòng này
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }
  openFileUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
input.accept = 'image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    input.onchange = () => this.handleFileUpload(input.files);
    input.click();
  }
  selectPost(post: PostModel): void {
    this.selectedPost = post;
    this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(post.Content);
  }

  handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
  
    const totalFiles = files.length;
    let loadedCount = 0;
    const contentParts: string[] = [];
  
    Array.from(files).forEach(file => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64 = reader.result as string;
  
        let content = '';
        if (file.type === 'application/pdf') {
          content = `<embed src="${base64}" type="application/pdf" width="100%" height="300px" />`;
        } else if (file.type.startsWith('image/')) {
          content = `<img src="${base64}" alt="${file.name}" style="max-width: 100%; height: auto;" />`;
        } else {
          content = `<a href="${base64}" download="${file.name}" target="_blank">📎 ${file.name}</a>`;
        }
  
        contentParts.push(content);
        loadedCount++;
  
        if (loadedCount === totalFiles) {
          // Dùng ngModel để cập nhật editor
          this.newPost.Content += contentParts.join('');
        }
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  loadPosts(): void {
    this.isLoading = true; // Bắt đầu loading
    this.postService.getAllPosts().subscribe(
      (data) => {
        this.posts = data;
        this.isLoading = false; // Bắt đầu loading
      },
      (error) => {
        console.error('Error loading posts', error);
        this.isLoading = false; // Bắt đầu loading
      }
    );
  }



  editPost(post: PostModel): void {
    this.router.navigate(['/admin/posts/edit', post.Id]);
  }

  deletePost(postId: string): void {
    const isConfirmed = window.confirm('Bạn chắc chắn muốn xóa bài đăng này?');
    if (isConfirmed) {
      this.isLoading= true;
      this.postService.deletePost(postId).subscribe(
        () => {
          this.loadPosts(); // Reload posts after deletion
          this.isLoading = false;
        },
        (error) => {
          console.error('Error deleting post', error);
          this.isLoading = false;
        }
      );
    }
  }

addPost() {
  this.showModal = true;
  this.newPost = { Title: '', Content: '' };
}

closeModal() {
  this.showModal = false;
}


savePost(post: any) {
  this.isLoading  = true;
  console.log(post.Content);
  this.postService.createPost(post).subscribe({
    next: (newPost) => {
      // Nếu bạn không reload từ server, thêm trực tiếp vào danh sách:
      this.posts.push(newPost);
      alert('🎉 Thêm bài đăng thành công!');
      // Đóng modal và reset form
      this.closeModal();
      this.isLoading = false;
      this.loadPosts();
    },
    error: (err) => {
      console.error('Lỗi khi tạo bài đăng:', err);
      alert('Tạo bài đăng thất bại. Vui lòng thử lại!');
      this.isLoading = false;
    }
  });
}


}


