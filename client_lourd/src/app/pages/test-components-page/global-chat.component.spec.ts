import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalChatComponent } from './global-chat.component';

describe('TestComponentsPageComponent', () => {
    let component: GlobalChatComponent;
    let fixture: ComponentFixture<GlobalChatComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GlobalChatComponent],
        });
        fixture = TestBed.createComponent(GlobalChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
