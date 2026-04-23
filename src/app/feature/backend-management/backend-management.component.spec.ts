import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendManagementComponent } from './backend-management.component';

describe('BackendManagementComponent', () => {
  let component: BackendManagementComponent;
  let fixture: ComponentFixture<BackendManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackendManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackendManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});