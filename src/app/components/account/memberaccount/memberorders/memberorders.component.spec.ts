import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberordersComponent } from './memberorders.component';

describe('MemberordersComponent', () => {
  let component: MemberordersComponent;
  let fixture: ComponentFixture<MemberordersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberordersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberordersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
