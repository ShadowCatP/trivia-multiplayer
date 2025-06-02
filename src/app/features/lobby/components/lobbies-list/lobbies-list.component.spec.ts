import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbiesListComponent } from './lobbies-list.component';

describe('LobbiesListComponent', () => {
  let component: LobbiesListComponent;
  let fixture: ComponentFixture<LobbiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LobbiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LobbiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
