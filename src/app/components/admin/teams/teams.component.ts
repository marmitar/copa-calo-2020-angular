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
    readonly form = this._fb.group({
        name: [null, Validators.required],
        init: [null]
    })
    logo: File

    constructor(
        private _fb: FormBuilder,
        private _ldn: LoadingService,
        private _msgs: MessagesService,
        private _cols: CollectionsService,
        private _storage: AngularFireStorage
    ) { }

    async create() {
        const {name, init} = this.form.value
        try {
            const task = this._storage.ref(`/teams/${init}`).put(this.logo)
            const creation = this._cols.team(init).set({ name, initials: init })
            await this._ldn.runOn(Promise.all([task.then(), creation]))

            this._msgs.hint(`Equipe ${name} criada`)
        } catch (err) {
            await this.delete(false)
            this._msgs.error(this._errorMsg(err), err)
        }

    }

    async delete(show = true) {
        const {name, init} = this.form.value
        try {
            const task =this._storage.ref(`/teams/${init}`).delete()
            const del = this._cols.team(init).delete()
            await this._ldn.runOn(Promise.all([task, del]))

            if (show) {
                this._msgs.hint(`Equipe ${name} deletada`)
            }
        } catch (err) {
            if (show) {
                this._msgs.error(this._errorMsg(err), err)
            }
        }
    }

    private _errorMsg(err: any): string {
        if (err.message) {
            return `${err.message}`
        } else {
            return `${err}`
        }
    }
}
