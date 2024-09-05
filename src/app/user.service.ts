import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userUrl = 'https://jsonplaceholder.typicode.com/users';
  private http = inject(HttpClient);

  //Retrieve team members
  //Read-only data
  members = toSignal(this.http.get<User[]>(this.userUrl), { initialValue: [] });

  constructor() {
    effect(() => {
      // console.log('this.members() :>> ', this.members());
    });
  }

  getCurrentMember(id: number): User | undefined {
    return this.members().find((m) => m.id === id);
  }
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  website: string;
}
