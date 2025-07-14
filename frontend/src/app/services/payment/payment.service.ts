import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BASE_URL } from '../../env/env';

export interface Payment {
  payment_id?: number | string; // Can be string from backend
  student_id: number | string; // Can be string from backend
  service_type: string;
  amount: number | string; // Can be string from backend  <-- FIXED
  payment_date: string;
  payment_time: string;
  student_name?: string; // For display purposes
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: any;
  count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = BASE_URL;
  private apiUrl = `${this.baseUrl}/payment`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   * Create a new payment
   * POST /payment/create
   */
  createPayment(paymentData: Partial<Payment>): Observable<Payment> {
    const url = `${this.apiUrl}/create`;

    console.log('Creating payment with data:', paymentData);
    console.log('API URL:', url);

    return this.http
      .post<PaymentResponse>(url, paymentData, this.httpOptions)
      .pipe(
        map((response) => {
          console.log('Payment API Response:', response);

          if (response.status === 'success') {
            // Return the payment data with the new payment_id
            return {
              ...paymentData,
              payment_id: response.data.payment_id,
            } as Payment;
          } else {
            throw new Error(response.message || 'Failed to create payment');
          }
        }),
        catchError((error) => {
          console.error('Payment creation error:', error);

          // Handle different types of errors
          let errorMessage = 'Failed to process payment';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.status === 0) {
            errorMessage =
              'Unable to connect to server. Please check your connection.';
          } else if (error.status >= 400 && error.status < 500) {
            errorMessage = 'Invalid payment data provided.';
          } else if (error.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Get all payments
   * GET /payment/get_all
   */
  getAllPayments(): Observable<Payment[]> {
    const url = `${this.apiUrl}/get_all`;

    return this.http.get<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data as Payment[];
        } else {
          throw new Error(response.message || 'Failed to retrieve payments');
        }
      }),
      catchError((error) => {
        console.error('Error fetching payments:', error);
        return throwError(() => new Error('Failed to load payments'));
      })
    );
  }

  /**
   * Get payment by ID
   * GET /payment/get_by_id/{id}
   */
  getPaymentById(id: number): Observable<Payment> {
    const url = `${this.apiUrl}/get_by_id/${id}`;

    return this.http.get<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data as Payment;
        } else {
          throw new Error(response.message || 'Payment not found');
        }
      }),
      catchError((error) => {
        console.error('Error fetching payment:', error);
        return throwError(() => new Error('Failed to load payment'));
      })
    );
  }

  /**
   * Get payments by student ID
   * GET /payment/get_by_student/{student_id}
   */
  getPaymentsByStudent(studentId: number): Observable<Payment[]> {
    const url = `${this.apiUrl}/get_by_student/${studentId}`;

    return this.http.get<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data as Payment[];
        } else {
          throw new Error(
            response.message || 'Failed to retrieve student payments'
          );
        }
      }),
      catchError((error) => {
        console.error('Error fetching student payments:', error);
        return throwError(() => new Error('Failed to load student payments'));
      })
    );
  }

  /**
   * Get payments by service type
   * GET /payment/get_by_service/{service_type}
   */
  getPaymentsByServiceType(serviceType: string): Observable<Payment[]> {
    const url = `${this.apiUrl}/get_by_service/${encodeURIComponent(
      serviceType
    )}`;

    return this.http.get<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data as Payment[];
        } else {
          throw new Error(response.message || 'Failed to retrieve payments');
        }
      }),
      catchError((error) => {
        console.error('Error fetching payments by service:', error);
        return throwError(
          () => new Error('Failed to load payments by service type')
        );
      })
    );
  }

  /**
   * Get payment statistics
   * GET /payment/get_stats
   */
  getPaymentStatistics(): Observable<any> {
    const url = `${this.apiUrl}/get_stats`;

    return this.http.get<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return response.data;
        } else {
          throw new Error(
            response.message || 'Failed to retrieve payment statistics'
          );
        }
      }),
      catchError((error) => {
        console.error('Error fetching payment statistics:', error);
        return throwError(() => new Error('Failed to load payment statistics'));
      })
    );
  }

  /**
   * Update an existing payment
   * PUT /payment/update/{id}
   */
  updatePayment(
    id: number,
    paymentData: Partial<Payment>
  ): Observable<Payment> {
    const url = `${this.apiUrl}/update/${id}`;

    return this.http
      .put<PaymentResponse>(url, paymentData, this.httpOptions)
      .pipe(
        map((response) => {
          if (response.status === 'success') {
            return response.data as Payment;
          } else {
            throw new Error(response.message || 'Failed to update payment');
          }
        }),
        catchError((error) => {
          console.error('Payment update error:', error);
          let errorMessage = 'Failed to update payment';

          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * Delete a payment
   * DELETE /payment/delete/{id}
   */
  deletePayment(id: number): Observable<boolean> {
    const url = `${this.apiUrl}/delete/${id}`;

    return this.http.delete<PaymentResponse>(url).pipe(
      map((response) => {
        if (response.status === 'success') {
          return true;
        } else {
          throw new Error(response.message || 'Failed to delete payment');
        }
      }),
      catchError((error) => {
        console.error('Payment deletion error:', error);
        let errorMessage = 'Failed to delete payment';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
