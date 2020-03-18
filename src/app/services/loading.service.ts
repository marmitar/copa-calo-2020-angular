import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { tap, scan, shareReplay, map } from 'rxjs/operators'


const enum Step {
    increment,
    decrement
}


@Injectable({
    providedIn: 'root'
})
export class LoadingService {

    private step$ = new Subject<Step>()
    private count$ = this.step$.pipe(
        scan((cnt, step) => step == Step.increment? cnt + 1 : cnt - 1, 0),
        shareReplay(1)
    )

    readonly running$ = this.count$.pipe(map(cnt => cnt > 0))

    constructor() { }

    start() {
        this.step$.next(Step.increment)

        let stopped = false
        return () => {
            if (!stopped) {
                this.step$.next(Step.decrement)
                stopped = true
            }
        }
    }

    runUntil<T>(onlyFinished?: boolean) {
        const stop = this.start()
        const onNext = onlyFinished? () => undefined : stop
        return tap<T>(onNext, stop, stop)
    }

    async runOn<T>(action: Promise<T>) {
        const stop = this.start()

        try {
            return await action
        } finally {
            stop()
        }
    }
}
