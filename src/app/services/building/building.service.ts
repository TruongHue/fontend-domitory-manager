import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {

  private apiUrl = 'https://localhost:7206/api/Building';

  constructor(private http: HttpClient) {}

  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  getBuildingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-id/${id}`);
  }

  postBuilding(newBuilding: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, newBuilding);
  }

   
  updateBuildingStatus(IdBuilding: number, newStatus: number):Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status`, { IdBuilding, Status: newStatus });
  }
}
