import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {

  private apiUrl = 'https://domitory-backend.onrender.com/api/Building';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getBuildings(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }
  
  getBuildingById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-id/${id}`, { headers: this.getAuthHeaders() });
  }

  postBuilding(newBuilding: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, newBuilding, { headers: this.getAuthHeaders() });
  }

  updateBuildingStatus(IdBuilding: string, newStatus: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status`, { IdBuilding, Status: newStatus }, { headers: this.getAuthHeaders() });
  }

  updateBuilding(IdBuilding: string, Building: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${IdBuilding}`, Building, { headers: this.getAuthHeaders() });
  }
  
  deleteBuilding(IdBuilding: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${IdBuilding}`, { headers: this.getAuthHeaders() });
  }
}
