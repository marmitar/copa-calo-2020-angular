import { Component, OnInit } from '@angular/core'
import { LoadingService } from './services/loading.service'
import { ObserversService } from '$$/observers.service'
import { UsersService } from './services/users.service'

import { Observable, of } from 'rxjs'


export interface Route {
    title: string
    route: string
    when: Observable<boolean>
}

export abstract class GlobalLoadingService extends LoadingService { }


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [
        { provide: GlobalLoadingService, useClass: LoadingService }
    ]
})
export class AppComponent implements OnInit {
    readonly title = 'Competição'

    routes: Route[]
    mobile$: Observable<boolean>

    constructor(
        public ldn: GlobalLoadingService,
        private obs: ObserversService,
        private usr: UsersService
    ) { }

    ngOnInit() {
        this.routes = [
            { title: 'Test', route: '/test', when: of(true) },
            { title: 'Admin', route: '/admin', when: this.usr.isAdmin$ }
        ]

        this.mobile$ = this.obs.isHPortrait$
    }
}
