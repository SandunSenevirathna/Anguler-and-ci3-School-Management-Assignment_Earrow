import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllAttendanceComponent } from './show-all-attendance.component';

describe('ShowAllAttendanceComponent', () => {
  let component: ShowAllAttendanceComponent;
  let fixture: ComponentFixture<ShowAllAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAllAttendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAllAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
