import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PlayerListService } from '@app/services/game-services/player-list/player-list.service';
import { SortingService } from '@app/services/general-services/sorting-service/sorting.service';
import { PlayerListComponent } from './player-list.component';

describe('PlayerListComponent', () => {
    let component: PlayerListComponent;
    let fixture: ComponentFixture<PlayerListComponent>;
    let playerListServiceSpy: jasmine.SpyObj<PlayerListService>;
    let sortingServiceSpy: jasmine.SpyObj<SortingService>;

    beforeEach(() => {
        playerListServiceSpy = jasmine.createSpyObj('PlayerListService', ['sortById', 'changeChatStatus']);
        sortingServiceSpy = jasmine.createSpyObj('SortingService', ['sortById']);
        sortingServiceSpy.sortsOptions = [
            { id: 1, name: 'Nom' },
            { id: 2, name: 'Pointage' },
            { id: 3, name: "État d'intéraction" },
        ];
        playerListServiceSpy.playerList = [
            { name: 'Bob', points: 50, isInGame: true, interacted: false, submitted: false, canChat: true },
            { name: 'Alice', points: 20, isInGame: false, interacted: false, submitted: false, canChat: true },
        ];
        TestBed.configureTestingModule({
            declarations: [PlayerListComponent],
            imports: [FormsModule],
            providers: [
                { provide: PlayerListService, useValue: playerListServiceSpy },
                { provide: SortingService, useValue: sortingServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(PlayerListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getters should return the expected values', () => {
        expect(component.sortsOptions).toEqual(sortingServiceSpy.sortsOptions);
        expect(component.playerList).toEqual(playerListServiceSpy.playerList);
    });
    it('onSortChange should call playerListService.sortById', () => {
        component.onSortChange(component.sortId, 'asc');
        expect(sortingServiceSpy.sortById).toHaveBeenCalledWith(component.sortId, 'asc', playerListServiceSpy.playerList);
    });
    it('changeChatStatus should call playerListService.changeChatStatus', () => {
        component.changeChatStatus('Ronaldinho');
        expect(playerListServiceSpy.changeChatStatus).toHaveBeenCalledWith('Ronaldinho');
    });
});
