import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllUserComponent } from './show-all-user.component';

describe('ShowAllUserComponent', () => {
  let component: ShowAllUserComponent;
  let fixture: ComponentFixture<ShowAllUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAllUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAllUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
