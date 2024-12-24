import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutoraccountComponent } from './tutoraccount.component';

describe('TutoraccountComponent', () => {
  let component: TutoraccountComponent;
  let fixture: ComponentFixture<TutoraccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutoraccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutoraccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
