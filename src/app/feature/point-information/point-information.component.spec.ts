import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointInformationComponent } from './point-information.component';

describe('PointInformationComponent', () => {
  let component: PointInformationComponent;
  let fixture: ComponentFixture<PointInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
