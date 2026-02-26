import { Component } from '@angular/core';
import { StatsCardsComponent } from './stats-cards/stats-cards.component';
import { ModuleCardsComponent } from './module-cards/module-cards.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatsCardsComponent, ModuleCardsComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
