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
    private ref = this.create()

    constructor(private overlay: Overlay) { }

    private create() {
        return this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'dark-backdrop',
            positionStrategy: this.overlay.position()
                .global()
                .centerHorizontally()
                .centerVertically()
        })
    }

    runOn<T>(action: Promise<T>): Promise<T>
    runOn<T>(action: Observable<T>, onlyFinished?: boolean): Observable<T>
    runOn<T>(action: Promise<T> | Observable<T>, onlyFinished?: boolean): Promise<T> | Observable<T> {
        const portal = new ComponentPortal(MatSpinner)
        this.ref.attach(portal)
        const stop = () => this.stop()

        if ('then' in action) {
            return action.finally(stop)

        } else {
            const onNext = onlyFinished? () => undefined : stop
            return action.pipe(tap(onNext, stop, stop))
        }
    }

    private stop() {
        this.ref.detach()
    }
}
