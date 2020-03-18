import { Component, HostBinding } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'

import { AthletesService } from '$$/athletes.service'
import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'
import { TeamsService } from '$$/teams.service'


@Component({
    selector: 'app-athlete-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class AthletesCreateComponent {
    readonly form = this.fb.group({
        name: [null, Validators.required],
        rg: [null, Validators.required],
        rgOrgao: [null, Validators.required],

        sex: [null, Validators.required]
    })

    @HostBinding('class') class = 'container'


    constructor(
        private atl: AthletesService,
        public tms: TeamsService,
        private ldn: LoadingService,
        private msgs: MessagesService,
        private fb: FormBuilder
    ) { }

    async submit() {
        try {
            const athlete = this.form.value
            await this.ldn.runOn(this.atl.createAthletes({...athlete}))

            const artigo = athlete.sex === 'fem' ? 'a' : 'o'
            this.msgs.hint(`${athlete.name} registrad${artigo}`)
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
