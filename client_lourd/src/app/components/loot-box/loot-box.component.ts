import { Component } from '@angular/core';

@Component({
    selector: 'app-loot-box',
    templateUrl: './loot-box.component.html',
    styleUrls: ['./loot-box.component.scss'],
})
export class LootBoxComponent {
    isMoved = false;

    toggleMove() {
        this.isMoved = !this.isMoved;
    }
}
