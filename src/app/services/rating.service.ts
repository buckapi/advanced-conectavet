import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout, map } from 'rxjs/operators';

export interface RatingResponse {
  average: number;
  totalRatings: number;
  ratingDistribution: {
    [key: string]: number;
  };
  comments: Array<{
    comment: string;
    idUser: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'https://conectavet.cl:3000';

  constructor(private http: HttpClient) { }

  getRatingsByMemberId(memberId: string): Observable<RatingResponse> {
    const headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    const defaultResponse: RatingResponse = {
      average: 0,
      totalRatings: 0,
      ratingDistribution: {},
      comments: []
    };

    return this.http.get<RatingResponse>(`${this.apiUrl}/ratings/${memberId}`, {
      headers,
      responseType: 'json' as const
    }).pipe(
      timeout(5000),
      map(response => response as RatingResponse),
      catchError(error => {
        console.error('Error fetching ratings:', error);
        return of(defaultResponse);
      })
    );
  }

  // Helper method to get formatted rating
  getFormattedRating(rating: number): string {
    return rating.toFixed(1);
  }

  // Helper method to generate stars array for rating display
  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
}
