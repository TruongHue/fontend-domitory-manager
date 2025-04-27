import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostmanagerService {
  private apiUrl = `https://domitory-backend.onrender.com/api/Post`;
  private feedbackApiUrl = `https://domitory-backend.onrender.com/api/Feedback`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders();
  }

  getAllPosts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPostById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPost(post: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, post, { headers: this.getAuthHeaders() });
  }

  updatePost(id: string, post: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, post, { headers: this.getAuthHeaders() });
  }

  deletePost(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getAllFeedbacks(): Observable<any[]> {
    return this.http.get<any[]>(this.feedbackApiUrl, { headers: this.getAuthHeaders() });
  }

  getFeedbackById(id: string): Observable<any> {
    return this.http.get<any>(`${this.feedbackApiUrl}/account/${id}`, { headers: this.getAuthHeaders() });
  }

  createFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(this.feedbackApiUrl, feedback, { headers: this.getAuthHeaders() });
  }

  deleteFeedback(id: string): Observable<void> {
    return this.http.delete<void>(`${this.feedbackApiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  updateFeedbackResponse(id: string, response: string): Observable<any> {
    return this.http.put(`${this.feedbackApiUrl}/${id}/response`, JSON.stringify(response), {
      headers: this.getAuthHeaders().set('Content-Type', 'application/json'),
      responseType: 'text' as 'json'
    });
  }
}
