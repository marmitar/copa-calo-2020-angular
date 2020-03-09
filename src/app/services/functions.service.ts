import { Injectable } from '@angular/core'
import { AngularFireFunctions } from '@angular/fire/functions'
import { AngularFireAuth } from '@angular/fire/auth'

import { Observable, OperatorFunction, of } from 'rxjs'
import { exhaustMap, throwIfEmpty, first, filter, map } from 'rxjs/operators'

import { customClaims } from '@angular/fire/auth-guard'


export type Role = {
    role?: 'admin' | 'none' | 'arb'
    team?: undefined
} | {
    role: 'dm',
    team: string
}
export type User = Role & {email: string}


@Injectable({
    providedIn: 'root'
})
export class FunctionsService {

    constructor(
        private fns: AngularFireFunctions,
        private auth: AngularFireAuth
    ) { }

    userRole(): Observable<Role> {
        return this.auth.user.pipe(
            exhaustMap(user => {
                if (user === null) {
                    return of({})

                } else {
                    return customClaims(of(user))
                }
            }),
            map(claims => claims ?? {})
        )
    }

    isAdmin(): Observable<boolean> {
        return this.userRole().pipe(
            map(claims => claims.role === 'admin')
        )
    }

    private requireRole<T>(role: Role): OperatorFunction<T, T> {
        function match(claims?: any) {
            return claims?.role === role.role
                && (!role.team || claims?.team === role.team)
        }

        return obs => this.auth.user.pipe(
            first(),
            filter(user => user !== null),
            customClaims,
            filter(match),
            throwIfEmpty(() => new Error('Usuário não tem permissão')),
            exhaustMap(() => obs)
        )
    }

    generatePassword(): Observable<string> {
        const func = this.fns.httpsCallable('generatePassword')
        return func(null).pipe(this.requireRole({role: 'admin'}))
    }

    updateUser(email: string, password?: string, role?: Role): Observable<void> {
        const func = this.fns.httpsCallable('updateUser')
        return func({email, password, role}).pipe(this.requireRole({role: 'admin'}))
    }

    listAllUsers(): Observable<User[]> {
        const func = this.fns.httpsCallable('listAllUsers')
        return func(null).pipe(this.requireRole({role: 'admin'}))
    }
}
