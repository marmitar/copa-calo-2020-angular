import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder } from '@angular/forms'

import { Observable, Subscription } from 'rxjs'
import {
    map, delay, startWith, exhaustMap,
    retryWhen, take, shareReplay
} from 'rxjs/operators'

import { MessagesService } from '$$/messages.service'
import { UsersService } from '$$/users.service'
import { LoadingService } from '$$/loading.service'


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
        private usr: UsersService,
        private ldn: LoadingService
    ) {}

    ngOnInit() {
        this.users$ = this.usr.listAllUsers().pipe(
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
        const emailFormVal = this.form.get('email')!.valueChanges as Observable<string | undefined | null>
        this.filteredEmails$ = emailFormVal.pipe(
            startWith(''),
            exhaustMap(email => this.users$.pipe(
                map(users => {
                    const filtered = filterUsers(users, email)
                    if (filtered.length === 1 && filtered[0].email.toLowerCase() === email?.toLowerCase()) {
                        this.setRole(users[0])
                    }
                    return filtered.map(user => user.email)
                })
            ))
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

    setRole({role, team}: {role?: string, team?: Team}) {
        if (role) {
            this.form.get('role')!.setValue(role)
        }
        if (team) {
            this.form.get('team')!.setValue(team)
        }
    }

    async genPasswd(): Promise<void> {
        try {
            const passwd = await this.usr.generatePassword().toPromise()
            this.form.get('password')!.setValue(passwd)
        } catch (err) {
            this.emitError(err)
        }
    }

    async submit() {
        try {
			const {email, password, role, team} = this.form.value
            const ans = this.usr.updateUser(email, password, {role, team})

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

function filterUsers(users: User[], email?: string | null): User[] {
    const lower = email?.toLowerCase() ?? ''

    return users.filter(user => user.email.toLowerCase().startsWith(lower))
}
