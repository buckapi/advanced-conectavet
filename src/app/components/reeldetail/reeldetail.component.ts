// import { Component } from '@angular/core';
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';


@Component({
  selector: 'app-reeldetail',
  standalone: true,
  imports: [],
  templateUrl: './reeldetail.component.html',
  styleUrl: './reeldetail.component.css'
})
export class ReeldetailComponent implements AfterViewInit {



  @ViewChild('slider') slider: ElementRef | undefined;
  slideCount: number = 0;
  slideWidth: number = 0;
  sliderUlWidth: number = 0;
  time: number = 2; // Tiempo para la barra de progreso
  timer: number = 30; // Intervalo del slider
  percentTime: number = 0;
  isPause: boolean = false;
  tick: any;
  
  ngAfterViewInit() {
    this.initializeSlider();
  }

  initializeSlider() {
    if (this.slider) {
      const sliderElement = this.slider.nativeElement;
      this.slideCount = sliderElement.querySelectorAll('ul li').length;
      this.slideWidth = sliderElement.getAttribute('data-width');
      this.sliderUlWidth = (this.slideCount + 1) * this.slideWidth;

      this.startProgressbar();
      this.startSlide();
    }
  }

  startProgressbar() {
    this.resetProgressbar();
    this.percentTime = 0;
    this.tick = setInterval(() => this.interval(), this.timer);
  }

  interval() {
    if (!this.isPause) {
      this.percentTime += 1 / (this.time + 0.1);
      const bar = this.slider?.nativeElement.querySelector('.progress .bar');
      if (bar) {
        bar.style.width = `${this.percentTime}%`;
      }

      if (this.percentTime >= 100) {
        this.moveRight();
        this.startProgressbar();
      }
    }
  }

  resetProgressbar() {
    const bar = this.slider?.nativeElement.querySelector('.progress .bar');
    if (bar) {
      bar.style.width = '0%';
    }
    clearInterval(this.tick);
  }

  startSlide() {
    const sliderElement = this.slider?.nativeElement;
    if (sliderElement) {
      const lastChild = sliderElement.querySelector('ul li:last-child');
      const ulElement = sliderElement.querySelector('ul');
      ulElement.insertBefore(lastChild, ulElement.firstChild);

      ulElement.style.width = `${this.sliderUlWidth}vw`;
      ulElement.style.marginLeft = `-${this.slideWidth}vw`;

      const firstChild = ulElement.querySelector('li:first-child');
      ulElement.appendChild(firstChild);
    }
  }

  moveLeft() {
    const ulElement = this.slider?.nativeElement.querySelector('ul');
    if (ulElement) {
      ulElement.style.transition = '1s';
      ulElement.style.transform = `translateX(${this.slideWidth}vw)`;

      setTimeout(() => {
        const lastChild = ulElement.querySelector('li:last-child');
        ulElement.insertBefore(lastChild, ulElement.firstChild);

        ulElement.style.transition = 'none';
        ulElement.style.transform = `translateX(0vw)`;
      }, 1000);
    }
  }

  moveRight() {
    const ulElement = this.slider?.nativeElement.querySelector('ul');
    if (ulElement && this.slideCount > 2) {
      ulElement.style.transition = '1s';
      ulElement.style.transform = `translateX(-${this.slideWidth}vw)`;

      setTimeout(() => {
        const firstChild = ulElement.querySelector('li:first-child');
        ulElement.appendChild(firstChild);

        ulElement.style.transition = 'none';
        ulElement.style.transform = `translateX(0vw)`;
      }, 1000);
    }
  }

  // Controles para los botones "prev" y "next"
  prevSlide() {
    this.moveLeft();
    this.startProgressbar();
  }

  nextSlide() {
    this.moveRight();
    this.startProgressbar();
  }

  togglePause() {
    this.isPause = !this.isPause;
  }


}
