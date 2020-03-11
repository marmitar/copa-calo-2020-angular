import { Component, EventEmitter } from '@angular/core'
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { AngularFireAuth } from '@angular/fire/auth'

import { map } from 'rxjs/operators'
import * as firebase from 'firebase'
type UserCredental = firebase.auth.UserCredential

import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    readonly unlogged = this._auth.user.pipe(
        map(user => user === null)
    )

    constructor(private _auth: AngularFireAuth, private _matDialog: MatDialog) {}

    open() {
        return this._matDialog.open<LoginDialogComponent, undefined, UserCredental>(LoginDialogComponent, {
            height: '340px',
            width: '320px'
        })
    }

    async logout() {
        await this._auth.signOut()
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
            form: this._fb.group({
                email: [null, [Validators.required, Validators.email]],
                password: [null, Validators.required]
            })
        },
        signUp: {
            btn: 'Registrar',
            submit: (form: FormGroup) => this.signIn(form.value, true),
            form: this._fb.group({
                email: [null, [Validators.required, Validators.email]],
                password: [null, [Validators.required, Validators.minLength(6)]]
            })
        }
    }

    readonly error = new EventEmitter<string>()

    constructor(
        private _dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private _fb: FormBuilder,
        private _auth: AngularFireAuth,
        private _ldn: LoadingService,
        private _msgs: MessagesService
    ) { }

    async signIn({email, password}: {[key: string]: string}, signUp?: boolean) {
        const signingIn = signUp
            ? this._auth.createUserWithEmailAndPassword(email, password)
            : this._auth.signInWithEmailAndPassword(email, password)

        try {
            const creds = await this._ldn.runOn(signingIn)
            this._dialog.close()
            return creds

        } catch (err) {
            const msg = this.signInErrorMessage(err)
            this._msgs.error.emit(msg)
        }
    }

    signInErrorMessage(err: any): string {
        switch (err.code) {
            case 'auth/invalid-email':
                return 'E-mail inválido'
            case 'auth/user-disabled':
                return 'Usuário desativado'
            case 'auth/user-not-found':
                return 'Usuário não encontrado'
            case 'auth/wrong-password':
                return 'Senha errada'
            case 'auth/too-many-requests':
                return 'Muitas tentativas erradas, espere um pouco'
            case 'auth/email-already-exists':
                return 'E-mail já registrado'
        }
        if (err.message) {
            return `${err.message}`
        } else {
            return `${err}`
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
}
