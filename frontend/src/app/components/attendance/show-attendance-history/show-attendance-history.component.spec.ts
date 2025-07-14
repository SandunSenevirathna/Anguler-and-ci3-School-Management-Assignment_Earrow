import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAttendanceHistoryComponent } from './show-attendance-history.component';

describe('ShowAttendanceHistoryComponent', () => {
  let component: ShowAttendanceHistoryComponent;
  let fixture: ComponentFixture<ShowAttendanceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAttendanceHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAttendanceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
