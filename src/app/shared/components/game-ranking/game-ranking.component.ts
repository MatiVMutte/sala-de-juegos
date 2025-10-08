import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameResultsService, GameResult } from '../../services/game-results.service';

@Component({
  selector: 'app-game-ranking',
  imports: [CommonModule],
  templateUrl: './game-ranking.component.html'
})
export class GameRankingComponent implements OnInit {
  @Input() gameName: string = '';
  @Input() limit: number = 10;
  @Input() lowerIsBetter: boolean = false; // true si menor puntaje es mejor

  private gameResultsService = inject(GameResultsService);
  
  rankings = signal<GameResult[]>([]);
  loading = signal(true);

  async ngOnInit() {
    await this.loadRankings();
  }

  async loadRankings() {
    this.loading.set(true);
    const { data } = await this.gameResultsService.getTopResults(
      this.gameName, 
      this.limit,
      this.lowerIsBetter
    );
    
    if (data) {
      this.rankings.set(data);
    }
    
    this.loading.set(false);
  }

  getMedalEmoji(position: number): string {
    switch(position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  }

  getPositionClass(position: number): string {
    switch(position) {
      case 1: return 'bg-yellow-50 border-yellow-400';
      case 2: return 'bg-gray-50 border-gray-400';
      case 3: return 'bg-orange-50 border-orange-400';
      default: return 'bg-white border-gray-200';
    }
  }
}
