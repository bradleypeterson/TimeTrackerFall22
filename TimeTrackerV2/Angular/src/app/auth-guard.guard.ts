import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  return true;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const currentUser = localStorage.getItem('currentUser');
  const router = inject(Router);

  if(!currentUser){
    return router.parseUrl('/');
  }

  return true;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const tempUser = localStorage.getItem('currentUser');
  const router = inject(Router);
  
  if(tempUser){
    const currentUser = JSON.parse(tempUser);

    if(currentUser.type === 'admin'){
      return true;
    }
    else{
      return router.parseUrl('/dashboard');
    }
  }
  else{
    return router.parseUrl('/');
  }
}

export const instructGuard: CanActivateFn = (route, state) => {
  const tempUser = localStorage.getItem('currentUser');
  const router = inject(Router);
  
  if(tempUser){
    const currentUser = JSON.parse(tempUser);

    if(currentUser.type === 'admin' || currentUser.type === 'instructor'){
      return true;
    }
    else{
      return router.parseUrl('/dashboard');
    }
  }
  else{
    return router.parseUrl('/');
  }
}

export const studentGuard: CanActivateFn = (route, state) => {
  const tempUser = localStorage.getItem('currentUser');
  const router = inject(Router);
  
  if(tempUser){
    const currentUser = JSON.parse(tempUser);

    if(currentUser.type === 'admin' || currentUser.type === 'student'){
      return true;
    }
    else{
      return router.parseUrl('/dashboard');
    }
  }
  else{
    return router.parseUrl('/');
  }
}