import { Injectable } from '@angular/core'
import { AngularFireFunctions } from '@angular/fire/functions'
import { AngularFireAuth } from '@angular/fire/auth'
import { TeamsService } from '$$/teams.service'

import { Observable, throwError, MonoTypeOperatorFunction } from 'rxjs'
import { shareReplay, exhaustMap, map, first, startWith } from 'rxjs/operators'
import { User as FireUser } from 'firebase/app'


@Injectable({
    providedIn: 'root'
})
export class UsersService {

    constructor(
        private fns: AngularFireFunctions,
        public auth: AngularFireAuth,
        private teams: TeamsService
    ) { }

    readonly user$ = this.auth.user.pipe(
        startWith(null),
        exhaustMap(async user => {
            if (user !== null) {
                return await this.userData(user)
            } else {
                return null
            }
        }),
        shareReplay(1)
    )

    readonly isAdmin$ = this.user$.pipe(
        map(user => user?.role === 'admin')
    )

    private async userData(user: FireUser): Promise<User> {
        const result = await user.getIdTokenResult()
        const role = await this.getRole(result.claims)
        return Object.assign(role, {email: user.email!})
    }

    private async getRole({role, team}: {[key: string]: string | undefined}): Promise<Role> {
        let teamVal: Team | undefined = undefined
        if (team) {
            const next = this.teams.team(team).pipe(first())
            teamVal = await next.toPromise()
        }
        return { role, team: teamVal } as Role
    }

    requireRole<T>(role: string, team?: string): MonoTypeOperatorFunction<T> {
        function match(user: User | null) {
            return user?.role === role
                && (team === undefined
                    || user?.team?.initials === team)
        }
        const msg = 'Usuário não tem permissão para isso'

        return obs => this.user$.pipe(
            first(),
            exhaustMap(user => {
                if (match(user)) {
                    return obs
                } else {
                    return throwError(new Error(msg))
                }
            })
        )
    }

    generatePassword(): Observable<string> {
        return this.fns.httpsCallable('generatePassword')(null)
    }

    updateUser(email: string, password?: string, role?: Role): Observable<void> {
        const fun = this.fns.httpsCallable('updateUser')
        if (role) {
            const rRole = Object.assign(role, {team: role?.team?.initials})
            return fun({email, password, role: rRole})
        } else {
            return fun({email, password, role})
        }
    }

    listAllUsers(): Observable<User[]> {
        const listUsers = this.fns.httpsCallable('listAllUsers')
        return listUsers(null).pipe(this.requireRole('admin'))
    }
}
