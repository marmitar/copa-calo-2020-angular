import { Injectable } from '@angular/core'

import { Observable, Subject,  } from 'rxjs'
import { tap, scan, shareReplay, map } from 'rxjs/operators'


@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private count$ = new Subject<boolean>()
    readonly running$ = this.count$.pipe(
        scan((acc, cur) => cur? acc + 1 : acc - 1, 0),
        shareReplay(1),
        map(val => val > 0)
    )

    constructor() { }

    runOn<T>(action: Promise<T>): Promise<T>
    runOn<T>(action: Observable<T>, onlyFinished?: boolean): Observable<T>
    runOn<T>(action: Promise<T> | Observable<T>, onlyFinished?: boolean): Promise<T> | Observable<T> {
        this.count$.next(true)

        let stopped = false
        const stop = () => {
            if (!stopped) {
                this.count$.next(false)
                stopped = true
            }
        }

        if (action instanceof Promise) {
            return action.finally(stop)

        } else {
            const onNext = onlyFinished? () => undefined : stop
            return action.pipe(tap(onNext, stop, stop))
        }
    }
}
