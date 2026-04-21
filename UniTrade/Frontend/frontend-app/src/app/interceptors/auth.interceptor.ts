import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const browser = isPlatformBrowser(platformId);

  const isPublicRequest =
    req.url.includes('/api/login/') ||
    req.url.includes('/api/register/') ||
    (req.method === 'GET' && req.url.includes('/api/categories/')) ||
    (req.method === 'GET' && req.url.includes('/api/listings/'));

  if (isPublicRequest) {
    return next(req);
  }

  const token = browser ? sessionStorage.getItem('access') : null;

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};