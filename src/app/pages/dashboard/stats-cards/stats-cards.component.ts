import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  CardComponent,
  CardContentComponent,
} from '../../../shared/card/card.component';

interface Stat {
  label: string;
  value: string;
  change: string;
  icon: string;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [LucideAngularModule, CardComponent, CardContentComponent],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.scss',
})
export class StatsCardsComponent {
  stats: Stat[] = [
    {
      label: 'Usuarios Activos',
      value: '1,248',
      change: '+12.5%',
      icon: 'users',
    },
    {
      label: 'Productos',
      value: '856',
      change: '+3.2%',
      icon: 'package',
    },
    {
      label: 'Documentos',
      value: '2,340',
      change: '+8.1%',
      icon: 'file-text',
    },
    {
      label: 'Ingresos',
      value: '$45.2k',
      change: '+15.3%',
      icon: 'trending-up',
    },
  ];
}
