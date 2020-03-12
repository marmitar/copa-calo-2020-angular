import { Injectable } from '@angular/core'
import { AngularFireFunctions } from '@angular/fire/functions'

import { Observable } from 'rxjs'
import { ObserversService, Role } from '$$/observers.service'

export type User = Role & {email: string}


@Injectable({
    providedIn: 'root'
})
export class FunctionsService {

    constructor(
        private _fns: AngularFireFunctions,
        private _obs: ObserversService
    ) { }

    generatePassword(): Observable<string> {
        return this._fns.httpsCallable('generatePassword')(null)
    }

    updateUser(email: string, password?: string, role?: Role): Observable<void> {
        return this._fns.httpsCallable('updateUser')({email, password, role})
    }

    listAllUsers(): Observable<User[]> {
        const func = this._fns.httpsCallable('listAllUsers')
        return func(null).pipe(this._obs.requireRole({role: 'admin'}))
    }
}
