import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublicRequest =
    req.url.includes('/api/login/') ||
    req.url.includes('/api/register/') ||
    (req.method === 'GET' && req.url.includes('/api/categories/')) ||
    (req.method === 'GET' && req.url.includes('/api/listings/'));

  if (isPublicRequest) {
    return next(req);
  }

  let token = null;
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    token = localStorage.getItem('access');
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};