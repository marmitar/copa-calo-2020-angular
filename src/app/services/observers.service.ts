import { Injectable } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { AngularFireAuth } from '@angular/fire/auth'

import { of, OperatorFunction, throwError } from 'rxjs'
import { pluck, shareReplay, exhaustMap, map, first, startWith } from 'rxjs/operators'


export type Role = {
    role?: 'admin' | 'none' | 'arb'
    team?: undefined
} | {
    role: 'dm',
    team: string
}


@Injectable({
    providedIn: 'root'
})
export class ObserversService {

    constructor(
        private bpObserver: BreakpointObserver,
        private auth: AngularFireAuth
    ) { }

    readonly isHandset$ = this.bpObserver.observe(Breakpoints.Handset).pipe(
        pluck('matches'),
        shareReplay(1)
    )
    readonly isHPortrait$ = this.bpObserver.observe(Breakpoints.HandsetPortrait).pipe(
        pluck('matches'),
        shareReplay(1)
    )

    readonly user$ = this.auth.user.pipe(
        startWith(null),
        exhaustMap(user => {
            if (user !== null && user !== undefined) {
                return user.getIdTokenResult().then<Role>(
                    result => result.claims ?? {}
                )
            } else {
                return of(null)
            }
        }),
        shareReplay(1)
    )
    readonly isAdmin$ = this.hasRole('admin')

    hasRole(role?: string, team?: string) {
        return this.user$.pipe(map(claims => {
            return claims?.role === role
                && (team === undefined || claims?.team === team)
        }))
    }

    requireRole<T>({role, team}: Role): OperatorFunction<T, T> {
        const msg = 'Usuário não tem permissão para isso'

        return obs => this.hasRole(role, team).pipe(
            first(),
            exhaustMap(hasRole => {
                if (hasRole) {
                    return obs
                } else {
                    return throwError(new Error(msg))
                }
            })
        )
    }
}
