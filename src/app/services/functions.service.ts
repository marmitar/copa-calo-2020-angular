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
        private fns: AngularFireFunctions,
        private obs: ObserversService
    ) { }

    generatePassword(): Observable<string> {
        return this.fns.httpsCallable('generatePassword')(null)
    }

    updateUser(email: string, password?: string, role?: Role): Observable<void> {
        return this.fns.httpsCallable('updateUser')({email, password, role})
    }

    listAllUsers(): Observable<User[]> {
        const func = this.fns.httpsCallable('listAllUsers')
        return func(null).pipe(this.obs.requireRole({role: 'admin'}))
    }
}
