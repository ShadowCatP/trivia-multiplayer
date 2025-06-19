import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostRoomComponent } from './host-room.component';

describe('HostRoomComponent', () => {
  let component: HostRoomComponent;
  let fixture: ComponentFixture<HostRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
