import { Component, OnInit } from '@angular/core'
import { Observable, merge } from 'rxjs'
import { map } from 'rxjs/operators'

import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { AngularFireAuth } from '@angular/fire/auth'

type State = 'logged' | 'loading' | 'out'


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    form: FormGroup
    logged: Observable<State>
    setState: (state: State) => void
    error: string | undefined

    constructor(
        private auth: AngularFireAuth,
        private builder: FormBuilder
    ) { }

    ngOnInit() {
        const loader = new Observable<State>(subscriber => {
            this.setState = (state) => {
                subscriber.next(state)
            }
        })

        this.logged = merge(loader, this.auth.user
            .pipe(map(user => user === null ? 'out' : 'logged' as State)))

        this.form = this.builder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        })
    }

    async login() {
        delete this.error
        this.setState('loading')

        try {
            await new Promise(resolve => setTimeout(resolve, 2500))

            const { email, password } = this.form.value
            return await this.auth.signInWithEmailAndPassword(email, password)

        } catch (err) {
            this.error = `${err}`
            this.setState('out')
        }
    }

    async logout() {
        delete this.error
        await this.auth.signOut()
    }
}
