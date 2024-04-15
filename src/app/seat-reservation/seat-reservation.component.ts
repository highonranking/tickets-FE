import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-seat-reservation',
  templateUrl: './seat-reservation.component.html',
  styleUrls: ['./seat-reservation.component.css']
})
export class SeatReservationComponent implements OnInit {

  // Number of seats to reserve
  numSeats: number = 0;
  
  // Array to store the availability status of seats
  availableSeats: boolean[] = [];
  
  // Message to display to the user
  message: string = '';
  
  // Array to store selected seat numbers
  selectedSeats: number[] = [];
  
  // Array to store booked seat numbers
  bookedSeatNumbers: number[] = [];
  isLoading: boolean = false; 


  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Fetch available seats when the component initializes
    this.getAvailableSeats();
  }

  // Fetch available seats from the server
  getAvailableSeats() {
    this.isLoading = true;
    this.http.get<boolean[]>('https://tickets-be-vure.onrender.com/seats').subscribe(
      data => {
        this.availableSeats = data;
        this.isLoading = false;
      },
      error => {
        console.error('Error fetching available seats:', error);
        this.isLoading = false;
      }
    );
  }

  // Reserve selected seats
  reserveSeats() {
    this.isLoading = true;
    if (!this.numSeats || this.numSeats <= 0 || this.numSeats > 7) {
      this.message = 'Invalid number of seats';
      return;
    }

    this.http.post<any>('https://tickets-be-vure.onrender.com/reserve', { numSeats: this.numSeats }).subscribe(
      data => {
        this.message = data.message;
        this.bookedSeatNumbers = data.bookedSeatNumbers;
        this.getAvailableSeats(); // Refresh available seats after reservation
        this.selectedSeats = []; // Clear selected seats after reservation
        this.isLoading = false;
      },
      error => {
        this.message = error.error.message;
        this.isLoading = false; 
      }
    );
  }

  // Toggle seat selection
  toggleSelection(seatNumber: number) {
    
    const index = this.selectedSeats.indexOf(seatNumber);
    if (index === -1) {
      if (this.selectedSeats.length < this.numSeats) {
        this.selectedSeats.push(seatNumber);
      }
    } else {
      this.selectedSeats.splice(index, 1);
    }
  }

  // Check if a seat is selected
  isSelected(seatNumber: number): boolean {
    return this.selectedSeats.includes(seatNumber);
  }

  // Reset all seats
  resetSeats() {
    this.isLoading = true;
    this.http.post<any>('https://tickets-be-vure.onrender.com/reset', {}).subscribe(
      data => {
        const decoder = new TextDecoder();
        const message = decoder.decode(data);
        this.message = message;
        this.getAvailableSeats(); // Refresh available seats after reset
        this.selectedSeats = []; // Clear selected seats after reset
        this.bookedSeatNumbers = []; // Clear booked seats after reset
        this.cdr.detectChanges(); // Trigger change detection to update the UI
        this.isLoading = false;
      },
      error => {
        this.message = error.error.message;
        this.isLoading = false;
      }
    );
  }
}
