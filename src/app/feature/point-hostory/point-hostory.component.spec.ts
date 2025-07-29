import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointHostoryComponent } from './point-hostory.component';

describe('PointHostoryComponent', () => {
  let component: PointHostoryComponent;
  let fixture: ComponentFixture<PointHostoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointHostoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointHostoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
