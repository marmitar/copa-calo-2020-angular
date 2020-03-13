import { Component } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'

import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'
import { CollectionsService } from '$$/collections.service'

import { AngularFireStorage } from '@angular/fire/storage'
import 'firebase/storage'


@Component({
    selector: 'app-admin-teams',
    templateUrl: './teams.component.html',
    styleUrls: ['../admin.component.scss']
})
export class AdminTeamsComponent {
    readonly form = this.fb.group({
        name: [null, Validators.required],
        init: [null]
    })
    logo: File

    constructor(
        private fb: FormBuilder,
        private ldn: LoadingService,
        private msgs: MessagesService,
        private cols: CollectionsService,
        private storage: AngularFireStorage
    ) { }

    async create() {
        const {name, init} = this.form.value
        try {
            const task = this.storage.ref(`/teams/${init}`).put(this.logo)
            const creation = this.cols.team(init).set({ name, initials: init })
            await this.ldn.runOn(Promise.all([task.then(), creation]))

            this.msgs.hint(`Equipe ${name} criada`)
        } catch (err) {
            await this.delete(false)
            this.emitError(err)
        }

    }

    async delete(show = true) {
        const {name, init} = this.form.value
        try {
            const task =this.storage.ref(`/teams/${init}`).delete()
            const del = this.cols.team(init).delete()
            await this.ldn.runOn(Promise.all([task, del]))

            if (show) {
                this.msgs.hint(`Equipe ${name} deletada`)
            }
        } catch (err) {
            if (show) {
                this.emitError(err)
            }
        }
    }

    emitError(err: any) {
        this.msgs.error(`${err.message ?? err}`, err)
    }
}
