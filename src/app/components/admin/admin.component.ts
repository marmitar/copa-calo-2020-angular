import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { Observable, Subscription } from 'rxjs'
import { map, tap, publishLast, refCount, retry, startWith, exhaustMap } from 'rxjs/operators'

import { MessagesService } from '$$/messages.service'
import { FunctionsService, User } from '$$/functions.service'


interface Query {
    email?: string,
    users: User[]
}


@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
    readonly form = this.fb.group({
        email: [null],
        password: [{value: null, disabled: true}],
        role:[null],
        team: [{value: null, disabled: true}]
    })

    private users$: Observable<User[]>
    filteredEmails$: Observable<string[]>
    teamDisable: Subscription

    constructor(
        private fb: FormBuilder,
        private msgs: MessagesService,
        private fns: FunctionsService
    ) {}

    ngOnInit() {
        this.users$ = this.fns.listAllUsers().pipe(
            retry(2),
            publishLast(),
            refCount()
        )

        const emailFormVal = this.form.get('email')!.valueChanges as Observable<string>
        this.filteredEmails$ = emailFormVal.pipe(
            startWith(''),
            exhaustMap(email => this.users$.pipe(
                map(this.filterUsers(email))
            )),
            tap(query => {
                if (query.users.length === 1 &&
                    query.users[0].email.toLowerCase() === query.email) {

                    this.setRole(query.users[0])
                }
            }),
            map(query => query.users.map(user => user.email))
        )

        const roleFormVal = this.form.get('role')!.valueChanges
        const teamFormCtrl = this.form.get('team')!
        this.teamDisable = roleFormVal.pipe(
            map(role => {
                if (role === 'dm') {
                    teamFormCtrl.enable({emitEvent: false})
                } else {
                    teamFormCtrl.disable({emitEvent: false})
                }
            })
        ).subscribe()
    }

    ngOnDestroy() {
        this.teamDisable.unsubscribe()
    }

    private filterUsers(email?: string): (users: User[]) => Query {
        return users => {
            if (email) {
                const lower = email.toLowerCase()
                return {
                    email: lower,
                    users: users.filter(user => user.email.toLowerCase().startsWith(lower))
                }
            } else {
                return { email, users }
            }
        }
    }

    private setRole({role, team}: {role?: string, team?: string}) {
        if (role) {
            this.form.get('role')!.setValue(role)
        }
        if (team) {
            this.form.get('team')!.setValue(team)
        }
    }

    async genPasswd(): Promise<void> {
        try {
            const passwd = await this.fns.generatePassword().toPromise()
            this.form.get('password')!.setValue(passwd)
        } catch (err) {
            this.emitError(err)
        }
    }

    togglePasswd() {
        const ctrl = this.form.get('password')!
        if (ctrl.disabled) {
            ctrl.enable()
        } else {
            ctrl.disable()
        }
    }

    async submit() {
        try {
            const {email, password, role, team} = this.form.value
            await this.fns.updateUser(email, password, {role, team}).toPromise()
        } catch (err) {
            this.emitError(err)
        }
    }

    emitError(err: any) {
        if (err.message) {
            this.msgs.error.emit(`${err.message}`)
        } else {
            this.msgs.error.emit(`${err}`)
        }
    }
}
