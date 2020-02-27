import { Component, OnInit, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs'
import { exhaustMap } from 'rxjs/operators'

import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFireFunctions } from '@angular/fire/functions'

import { User } from 'firebase/app'
import 'firebase/firestore'


interface AppUser extends User {
    role?: string
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    readonly title = 'copa-calo'
    user: Observable<AppUser | null>
    private generator: (({}) => Observable<string>)
    text: EventEmitter<string>

    constructor(
        private auth: AngularFireAuth,
        private functions: AngularFireFunctions
    ) { }

    ngOnInit() {
        this.text = new EventEmitter(true)

        this.user = this.auth.user.pipe(
            exhaustMap(async user => {
                if (user === null) {
                    return Promise.resolve(null)
                }

                const result = await user.getIdTokenResult()
                return Object.assign({}, user, result.claims)
            })
        )

        this.generator = this.functions.httpsCallable('generatePassword')
    }

    async generate() {
        const text = await this.generator({}).toPromise()

        this.text.emit(text)
    }
}
