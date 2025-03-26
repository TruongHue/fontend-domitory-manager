import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7206/api/Account/login'; // Địa chỉ API

  constructor(private http: HttpClient) {}

  login(userCode: string, password: string): Observable<any> {
    const body = {
      UserCode: userCode,
      Password: password
    };
    return this.http.post(this.apiUrl, body);
  }
}
