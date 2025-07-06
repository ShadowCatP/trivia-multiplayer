import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLobbyComponent } from './main-lobby.component';

describe('LobbyComponent', () => {
  let component: MainLobbyComponent;
  let fixture: ComponentFixture<MainLobbyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLobbyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLobbyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
