import { Component, Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core'
import { AsyncPipe } from '@angular/common'

import { ObserversService } from '$$/observers.service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    readonly title = 'Competição'

    readonly routes = [
        { title: 'Test', route: '/test' },
        { title: 'Admin', route: '/admin', when: this._obs.isAdmin$ }
    ]

    readonly mobile$ = this._obs.isHPortrait$
    readonly notMobile$ = this.mobile$.pipe(map(val => ! val))

    constructor(
        private _obs: ObserversService
    ) { }
}


interface Whennable {
    when?: boolean | Observable<boolean>
}


@Pipe({name: 'when', pure: false})
export class WhennablePipe implements PipeTransform, OnDestroy {
    private _async = new AsyncPipe(this._ref)

    constructor(private _ref: ChangeDetectorRef) {}

    ngOnDestroy() {
        this._async.ngOnDestroy()
    }

    transform({when}: Whennable): boolean {
        switch (typeof when) {
            case 'boolean':
                return when
            case 'undefined':
                return true
            default:
                return this._async.transform(when)!
        }
    }
}
