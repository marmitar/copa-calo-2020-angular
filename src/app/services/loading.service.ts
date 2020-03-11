import { Injectable } from '@angular/core'
import { Overlay } from '@angular/cdk/overlay'
import { ComponentPortal } from '@angular/cdk/portal'
import { MatSpinner } from '@angular/material/progress-spinner'

import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'


@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _ref = this.create()

    constructor(private _overlay: Overlay) { }

    private create() {
        return this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'dark-backdrop',
            positionStrategy: this._overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically()
        })
    }

    runOn<T>(action: Promise<T>): Promise<T>
    runOn<T>(action: Observable<T>, onlyFinished?: boolean): Observable<T>
    runOn<T>(action: Promise<T> | Observable<T>, onlyFinished?: boolean): Promise<T> | Observable<T> {
        const portal = new ComponentPortal(MatSpinner)
        this._ref.attach(portal)
        const stop = () => this._stop()

        if (action instanceof Promise) {
            return action.finally(stop)

        } else {
            const onNext = onlyFinished? () => undefined : stop
            return action.pipe(tap(onNext, stop, stop))
        }
    }

    private _stop() {
        this._ref.detach()
    }
}
