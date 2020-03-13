import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { Observable, Subscription } from 'rxjs'
import {
    map, tap, delay, startWith, exhaustMap,
    retryWhen, take, shareReplay
} from 'rxjs/operators'

import { MessagesService } from '$$/messages.service'
import { FunctionsService, User } from '$$/functions.service'
import { LoadingService } from '$$/loading.service'


interface Query {
    email: string,
    users: User[]
}


@Component({
    selector: 'app-admin-users',
    templateUrl: './users.component.html',
    styleUrls: ['../admin.component.scss']
})
export class AdminUsersComponent implements OnInit, OnDestroy {

    private users$: Observable<User[]>
    private autoTeamDisable: Subscription

    filteredEmails$: Observable<string[]>
    readonly form = this.fb.group({
        email: [null],
        password: [{value: null, disabled: true}],
        role:[null],
        team: [{value: null, disabled: true}]
    })

    constructor(
        private fb: FormBuilder,
        private msgs: MessagesService,
        private fns: FunctionsService,
        private ldn: LoadingService
    ) {}

    ngOnInit() {
        this.users$ = this.fns.listAllUsers().pipe(
            retryWhen(errors => errors.pipe(delay(1000), take(2))),
            shareReplay(1)
        )

        this.buildFilteredEmails()
        this.buildAutoTeamDisable()
    }

    ngOnDestroy() {
        this.autoTeamDisable.unsubscribe()
    }

    private buildFilteredEmails() {
        const emailFormVal = this.form.get('email')!.valueChanges as Observable<string>
        this.filteredEmails$ = emailFormVal.pipe(
            startWith(''),
            exhaustMap(email => this.users$.pipe(
                map(users => filterUsers(users, email))
            )),
            tap(query => {
                if (query.users.length === 1 &&
                    query.users[0].email.toLowerCase() === query.email) {

                    this.setRole(query.users[0])
                }
            }),
            map(query => query.users.map(user => user.email))
        )
    }

    private buildAutoTeamDisable() {
        const roleFormVal = this.form.get('role')!.valueChanges
        const teamFormCtrl = this.form.get('team')!

        this.autoTeamDisable = roleFormVal.subscribe(role => {
            if (role === 'dm') {
                teamFormCtrl.enable({emitEvent: false})
            } else {
                teamFormCtrl.disable({emitEvent: false})
            }
        })
    }

    setRole({role, team}: {role?: string, team?: string}) {
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
            const ans = this.fns.updateUser(email, password, {role, team})

            await this.ldn.runOn(ans.toPromise())
            this.msgs.hint('Usuário atualizado ou criado')
        } catch (err) {
            this.emitError(err)
        }
    }

    emitError(err: any) {
        this.msgs.error(`${err.message ?? err}`, err)
    }
}

function filterUsers(users: User[], email?: string | null): Query {
    const lower = email?.toLowerCase() ?? ''
    return {
        email: lower,
        users: users.filter(user => user.email.toLowerCase().startsWith(lower))
    }
}
