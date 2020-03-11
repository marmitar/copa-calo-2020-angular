import { Component } from '@angular/core'
import { ObserversService } from '$$/observers.service'


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

    readonly routes = [
        { title: 'Test', route: '/test' },
        { title: 'Admin', route: '/admin', when: this.obs.isAdmin$ }
    ]

    constructor(
        public obs: ObserversService
    ) { }
}
