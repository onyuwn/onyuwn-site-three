import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandlebrotComponent } from './mandlebrot.component';

describe('MandlebrotComponent', () => {
  let component: MandlebrotComponent;
  let fixture: ComponentFixture<MandlebrotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MandlebrotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MandlebrotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
