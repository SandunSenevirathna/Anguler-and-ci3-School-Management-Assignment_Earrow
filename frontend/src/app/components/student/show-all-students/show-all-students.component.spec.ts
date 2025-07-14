import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllStudentsComponent } from './show-all-students.component';

describe('ShowAllStudentsComponent', () => {
  let component: ShowAllStudentsComponent;
  let fixture: ComponentFixture<ShowAllStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAllStudentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAllStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
