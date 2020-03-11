import { Injectable } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { AngularFireAuth } from '@angular/fire/auth'

import { of, OperatorFunction } from 'rxjs'
import {
    pluck, shareReplay, exhaustMap,
    map, first, filter, throwIfEmpty
} from 'rxjs/operators'


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

    readonly isAdmin$ = this.hasRole({role: 'admin'})

    hasRole(role: Role) {
        function match(claims?: Role | null) {
            return claims?.role === role.role
                && (!role.team || claims?.team === role.team)
        }

        return this.user$.pipe(map(match))
    }

    requireRole<T>(role: Role): OperatorFunction<T, T> {
        const msg = 'Usuário não tem permissão para isso'

        return obs => this.hasRole(role).pipe(
            first(),
            filter(hasRole => hasRole),
            throwIfEmpty(() => new Error(msg)),
            exhaustMap(() => obs)
        )
    }
}
