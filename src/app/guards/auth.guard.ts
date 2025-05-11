import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  return checkAuth(route, state);
};

export const authGuardChild: CanActivateChildFn = (route, state) => {
  return checkAuth(route, state);
};

function checkAuth(route: any, state: any): boolean {
  const router = inject(Router); // ✅ Đây là cách đúng để lấy Router
  const userRole = localStorage.getItem('role');
  const requiredRole = route.data?.['role'];

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRole && userRole !== requiredRole) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
}
