import { Component, OnInit } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { AngularFireAuth } from '@angular/fire/auth'

import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import * as firebase from 'firebase'
type UserCredental = firebase.auth.UserCredential

import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    unlogged$: Observable<boolean>

    constructor(public auth: AngularFireAuth, private matDialog: MatDialog) {}

    ngOnInit() {
        this.unlogged$ = this.auth.user.pipe(
            startWith(null),
            map(user => user === null)
        )
    }

    open() {
        return this.matDialog.open<LoginDialogComponent, undefined, UserCredental>(LoginDialogComponent, {
            height: '340px',
            width: '320px'
        })
    }
}


class Context {
    readonly form: FormGroup
    readonly email: FormControl
    readonly password: FormControl
    readonly submit: () => Promise<any>

    constructor(
        private parent: LoginDialogComponent,
        private signUp: boolean,
        readonly btn: string,
        minLength?: number
    ) {
        this.email = new FormControl(null, [Validators.required, Validators.email])

        let validators = [Validators.required]
        if (minLength) {
            validators.push(Validators.minLength(minLength))
        }
        this.password = new FormControl(null, validators)

        this.form = new FormGroup({
            email: this.email,
            password: this.password
        })

        this.submit = () => this.parent.signIn(this.form.value, this.signUp)
    }
}


@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginDialogComponent implements OnInit {
    login: Context
    signUp: Context

    constructor(
        private dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private auth: AngularFireAuth,
        private ldn: LoadingService,
        private msgs: MessagesService
    ) { }

    ngOnInit() {
        this.login = new Context(this, false, 'Login')
        this.signUp = new Context(this, true, 'Registrar', 6)
    }

    async signIn({email, password}: {[key: string]: string}, signUp?: boolean) {
        const signingIn = signUp ?
            this.auth.createUserWithEmailAndPassword(email, password)
            : this.auth.signInWithEmailAndPassword(email, password)

        try {
            const creds = await this.ldn.runOn(signingIn)
            this.dialog.close()
            return creds

        } catch (err) {
            const msg = this.signInErrorMessage(err)
            this.msgs.error(msg, err)
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
            default:
                return `${err.message ?? err}`
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
            return `Tamanho mínimo é ${err.requiredLength}`
        }
    }
}
