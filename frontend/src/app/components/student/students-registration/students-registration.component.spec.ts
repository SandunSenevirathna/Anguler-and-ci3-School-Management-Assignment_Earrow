import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsRegistrationComponent } from './students-registration.component';

describe('StudentsRegistrationComponent', () => {
  let component: StudentsRegistrationComponent;
  let fixture: ComponentFixture<StudentsRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentsRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentsRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
