import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'admin-crops',
  template: `
  <div class="card">
    <h2>Crops</h2>
    <p class="small">All crops listed in Smart Mandi.</p>
    <table *ngIf="crops.length > 0; else noCrops">
      <thead>
        <tr>
          <th>Crop</th>
          <th>Farmer Name</th>
          <th>Phone</th>
          <th>District</th>
          <th>Price/kg</th>
          <th>Qty (kg)</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of crops">
          <td>{{ c.name }}</td>
          <td>{{ c.farmerName }}</td>
          <td>{{ c.farmerPhone }}</td>
          <td>{{ c.location }}</td>
          <td>{{ c.pricePerKg }}</td>
          <td>{{ c.quantity }}</td>
          <td>{{ c.quantity }}</td>
          <td><span class="badge">{{ c.status }}</span></td>
          <td>
            <button class="btn-sm btn-danger" (click)="deleteCrop(c)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <ng-template #noCrops>
      <p class="small">No crops found.</p>
    </ng-template>
  </div>
  `
})
export class CropsComponent implements OnInit {
  crops: any[] = [];
  constructor(private api: ApiService, private toast: ToastService) { }
  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getCrops().subscribe(c => this.crops = c);
  }

  deleteCrop(crop: any) {
    if (!confirm(`Delete crop "${crop.name}" by ${crop.farmerName}?`)) return;
    this.api.deleteCrop(crop._id).subscribe({
      next: () => {
        this.crops = this.crops.filter(c => c._id !== crop._id);
        this.toast.show('Crop deleted successfully', 'success');
      },
      error: () => this.toast.show('Failed to delete crop', 'error')
    });
  }
}
