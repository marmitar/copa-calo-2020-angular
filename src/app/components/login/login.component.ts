import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
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

    constructor(
        private dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private fb: FormBuilder,
        private auth: AngularFireAuth,
        private loading: LoadingService
    ) { }

    async signIn({email, password}: {[key: string]: string}, signUp?: boolean) {
        const creds = signUp
            ? this.auth.createUserWithEmailAndPassword(email, password)
            : this.auth.signInWithEmailAndPassword(email, password)

        try {
            return await this.loading.runOn(creds)

        } catch (err) {
            console.log(typeof err)
            console.log(err)

        } finally {
            this.dialog.close()
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
