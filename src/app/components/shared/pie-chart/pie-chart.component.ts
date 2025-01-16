import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="chart-container">
    <canvas #chartCanvas></canvas>
  </div>`,
  styles: [`
    .chart-container {
      position: relative;
      height: 200px;
      width: 100%;
    }
  `]
})
export class PieChartComponent implements OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() data!: ChartData<'pie', number[], string>;
  @Input() options?: ChartConfiguration['options'];

  private chart?: Chart;

  ngAfterViewInit() {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      if (changes['data']) {
        this.chart.data = this.data;
        this.chart.update();
      }
      if (changes['options']) {
        this.chart.options = this.options || {};
        this.chart.update();
      }
    }
  }

  private createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: this.data,
      options: this.options
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
