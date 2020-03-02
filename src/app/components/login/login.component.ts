import { Component, EventEmitter } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { AngularFireAuth } from '@angular/fire/auth'

import { map } from 'rxjs/operators'
import * as firebase from 'firebase'
type UserCredental = firebase.auth.UserCredential

import { LoadingService } from '$$/loading.service'


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    readonly unlogged = this.auth.user.pipe(
        map(user => user === null)
    )

    constructor(private auth: AngularFireAuth, private matDialog: MatDialog) {}

    open() {
        return this.matDialog.open<LoginDialogComponent, undefined, UserCredental>(LoginDialogComponent, {
            height: '360px',
            width: '320px'
        })
    }

    async logout() {
        await this.auth.signOut()
    }
}


@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginDialogComponent {

    readonly ctx = {
        login: {
            btn: 'Login',
            submit: (form: FormGroup) => this.signIn(form.value),
            form: this.fb.group({
                email: [null, [Validators.required, Validators.email]],
                password: [null, Validators.required]
            })
        },
        signUp: {
            btn: 'Registrar',
            submit: (form: FormGroup) => this.signIn(form.value, true),
            form: this.fb.group({
                email: [null, [Validators.required, Validators.email]],
                password: [null, [Validators.required, Validators.minLength(6)]]
            })
        }
    }

    readonly error = new EventEmitter<string>(true)

    constructor(
        private dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private fb: FormBuilder,
        private auth: AngularFireAuth,
        private loading: LoadingService
    ) { }

    async signIn({email, password}: {[key: string]: string}, signUp?: boolean) {
        const signingIn = signUp
            ? this.auth.createUserWithEmailAndPassword(email, password)
            : this.auth.signInWithEmailAndPassword(email, password)

        try {
            const creds = await this.loading.runOn(signingIn)
            this.dialog.close()
            return creds

        } catch (err) {
            if (err.message) {
                this.error.emit(`${err.message}`)
            } else {
                this.error.emit(`${err}`)
            }
        }
    }

    getValidationError(form: FormControl): string {
        if (form.hasError('required')) {
            return 'Precisa de um valor'
        } else if (form.hasError('email')) {
            return 'Não é um e-mail válido'
        } else {
            const err = form.getError('minlength')
            if (!err) {
                return 'Entrada inválida'
            }
            const {requiredLength} = err

            return `Tamanho mínimo é ${requiredLength}`
        }
    }

    // private async wait<T>(x: T, error?: boolean): Promise<T> {
    //     return new Promise((resolve, reject) => {
    //         setTimeout(() => {
    //             if (error) {
    //                 reject(x)
    //             } else {
    //                 // resolve(x)
    //             }
    //         }, 1500)
    //     })
    // }
}
