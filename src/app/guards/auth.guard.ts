import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = new Router();
  
  // Lấy thông tin token hoặc role từ LocalStorage (hoặc từ AuthService)
  const userRole = localStorage.getItem('role'); // Ví dụ: 'admin', 'staff', 'student'

  // Lấy role cần thiết từ route
  const requiredRole = route.data?.['role'];

  // Kiểm tra nếu người dùng chưa đăng nhập
  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  // Kiểm tra nếu người dùng không có quyền
  if (requiredRole && userRole !== requiredRole) {
    router.navigate(['/unauthorized']); // Chuyển hướng đến trang không có quyền truy cập
    return false;
  }

  return true;
};
