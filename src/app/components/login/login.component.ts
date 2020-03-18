import { Component, OnInit, Inject } from '@angular/core'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { AngularFireAuth } from '@angular/fire/auth'

import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import * as firebase from 'firebase'
type UserCredental = firebase.auth.UserCredential

import { LoadingService } from '$$/loading.service'
import { MessagesService } from '$$/messages.service'
import { UsersService } from '$$/users.service'


interface CtxData {
    email?: string
    password?: string
    signUp?: boolean,
}

interface DialogData {
    data?: CtxData | null,
    reopen: (data?: CtxData | null) => void
}


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

    open(data?: CtxData | null) {
        return this.matDialog.open<LoginDialogComponent, DialogData, UserCredental>(LoginDialogComponent, {
            height: '340px',
            width: '320px',
            data: {
                data,
                reopen: (data) => this.open(data)
            }
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

        this.submit = () => this.parent.signIn(this.value())
    }

    load({email, password}: CtxData) {
        if (email) {
            this.email.setValue(email)
        }
        if (password) {
            this.password.setValue(password)
        }
        this.parent.tab = this.signUp? 1 : 0
    }

    value(): CtxData {
        return {
            email: this.email.value,
            password: this.password.value,
            signUp: this.signUp
        }
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
    tab: 0 | 1 = 0

    constructor(
        private dialog: MatDialogRef<LoginDialogComponent, UserCredental>,
        private users: UsersService,
        private ldn: LoadingService,
        private msgs: MessagesService,
        @Inject(MAT_DIALOG_DATA) readonly data: DialogData
    ) { }

    ngOnInit() {
        this.login = new Context(this, false, 'Login')
        this.signUp = new Context(this, true, 'Registrar', 6)

        if (this.data.data) {
            if (this.data.data.signUp) {
                this.signUp.load(this.data.data)
            } else {
                this.login.load(this.data.data)
            }
        }
    }

    setTab(tab: 0 | 1) {
        if (tab == 0) {
            this.login.load(this.signUp.value())
        } else {
            this.signUp.load(this.login.value())
        }
    }

    async signIn({email, password, signUp}: CtxData) {
        const signingIn = signUp ?
            this.users.auth.createUserWithEmailAndPassword(email!, password!)
            : this.users.auth.signInWithEmailAndPassword(email!, password!)

        try {
            this.dialog.close()
            return await this.ldn.runOn(signingIn)

        } catch (err) {
            const msg = this.signInErrorMessage(err)
            this.msgs.error(msg, err)
            this.data.reopen({email, password, signUp})
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
