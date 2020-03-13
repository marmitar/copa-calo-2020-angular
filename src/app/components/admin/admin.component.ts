import { Component, HostBinding } from '@angular/core'


@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
    @HostBinding('class') class = 'collection'
}
