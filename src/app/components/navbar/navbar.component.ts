import { Component } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'

import { map, shareReplay } from 'rxjs/operators'
import { FunctionsService } from '$$/functions.service'


@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

    readonly isHandset$ = this.breakpoint
        .observe(Breakpoints.Handset).pipe(
            map(result => result.matches),
            shareReplay()
        )

    readonly routes = [
        { title: 'Test', route: '/test' },
        { title: 'Admin', route: '/admin', when: this.fns.isAdmin() }
    ]

    constructor(
        private breakpoint: BreakpointObserver,
        private fns: FunctionsService
    ) { }
}
