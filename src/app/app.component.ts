import { Component, OnInit } from '@angular/core'
import { LoadingService } from './services/loading.service'

import { ObserversService } from '$$/observers.service'
import { Observable, of } from 'rxjs'


export interface Route {
    title: string
    route: string
    when: Observable<boolean>
}


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'Competição'

    routes: Route[]
    mobile$: Observable<boolean>

    constructor(
        private obs: ObserversService,
        public ldn: LoadingService
    ) { }

    ngOnInit() {
        this.routes = [
            { title: 'Test', route: '/test', when: of(true) },
            { title: 'Admin', route: '/admin', when: this.obs.isAdmin$ }
        ]

        this.mobile$ = this.obs.isHPortrait$
    }
}
