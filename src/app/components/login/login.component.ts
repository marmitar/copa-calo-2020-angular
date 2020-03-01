import { Component } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
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

    readonly form = this.fb.group({
        email: [null, [Validators.required, Validators.email]],
        password: [null, Validators.required]
    })

    constructor(
        private dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private fb: FormBuilder,
        private auth: AngularFireAuth,
        private loading: LoadingService
    ) { }

    async login() {
        try {
            const {email, password} = this.form.value
            const signIn = this.auth.signInWithEmailAndPassword(email, password)
            return await this.loading.runOn(signIn)

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
