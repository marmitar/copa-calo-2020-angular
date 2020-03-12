import { Injectable } from '@angular/core'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { AngularFireAuth } from '@angular/fire/auth'

import { of, OperatorFunction } from 'rxjs'
import {
    pluck, shareReplay, exhaustMap,
    map, first, filter, throwIfEmpty, startWith
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
        private _bpObserver: BreakpointObserver,
        private _auth: AngularFireAuth
    ) { }

    readonly isHandset$ = this._bpObserver.observe(Breakpoints.Handset).pipe(
        pluck('matches'),
        shareReplay(1)
    )

    readonly isHPortrait$ = this._bpObserver.observe(Breakpoints.HandsetPortrait).pipe(
        pluck('matches'),
        shareReplay(1)
    )

    readonly user$ = this._auth.user.pipe(
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
        return obs => this.hasRole(role, team).pipe(
            first(),
            filter(hasRole => hasRole),
            throwIfEmpty(() => new Error(msg)),
            exhaustMap(() => obs)
        )
    }
}

const msg = 'Usuário não tem permissão para isso'
