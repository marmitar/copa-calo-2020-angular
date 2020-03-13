import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'

import { ObserversService } from '$$/observers.service'
import { CollectionsService } from '$$/collections.service'
import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'

import { Subscription } from 'rxjs'


@Component({
    selector: 'app-athlete-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class AthletesCreateComponent implements OnInit, OnDestroy {
    readonly form = this.fb.group({
        name: [null, Validators.required],
        rg: [null, Validators.required],
        rgOrgao: [null, Validators.required],

        sex: [null, Validators.required],
        team: [null, Validators.required]
    })

    constructor(
        public cols: CollectionsService,
        private obs: ObserversService,
        private ldn: LoadingService,
        private msgs: MessagesService,
        private fb: FormBuilder
    ) { }

    private teamAutoLock: Subscription

    ngOnInit() {
        const team = this.form.get('team')!
        this.teamAutoLock = this.obs.user$.subscribe(user => {
            if (user?.role === 'dm') {
                team.setValue(user.team)
                team.disable({emitEvent: false})
            } else {
                team.enable({emitEvent: false})
            }
        })
    }

    ngOnDestroy() {
        this.teamAutoLock.unsubscribe()
    }

    async submit() {
        try {
            await this.ldn.runOn(this.cols.addAthlete(this.form.value))

            const name = this.form.get('name')!.value
            this.msgs.hint(`${name} registrado`)
        } catch (err) {
            this.msgs.error(errorMessage(err), err)
        }
    }
}


function errorMessage(err: any) {
    if (err.message?.startsWith('Missing or insufficient permissions')) {
        return 'Você não tem permissão pra isso'
    } else {
        return `${err.message ?? err}`
    }
}
