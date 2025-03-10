import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-avatar-banner',
    templateUrl: './avatar-banner.component.html',
    styleUrls: ['./avatar-banner.component.scss'],
})
export class AvatarBannerComponent {
    @Input() avatarUrl!: string | number | undefined | null;
    @Input() bannerUrl!: string | number | undefined | null;
}
