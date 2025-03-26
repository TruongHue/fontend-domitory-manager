import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  
  private roomApiUrl = 'https://localhost:7206/api/Room';

  constructor(private http: HttpClient) { }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.roomApiUrl);
  }
  postRoom(newRoom: any): Observable<any> {
    return this.http.post<any>(this.roomApiUrl, newRoom);
  }
  updateRoomStatus(IdRoom: any, newStatus: number):Observable<any> {
    return this.http.put<any>(`${this.roomApiUrl}/status`, { IdRoom, Status: newStatus });
  }
  getRoomById(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.roomApiUrl}/by-id/${roomId}`);
  }
  
}
