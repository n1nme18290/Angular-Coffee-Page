import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoComponentsComponent } from './demo-components.component';

describe('DemoComponentsComponent', () => {
  let component: DemoComponentsComponent;
  let fixture: ComponentFixture<DemoComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoComponentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
