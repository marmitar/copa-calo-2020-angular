import { Injectable } from '@angular/core'

import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { AngularFirestore } from '@angular/fire/firestore'
import 'firebase/firestore'


@Injectable({
    providedIn: 'root'
})
export class TeamsService {

    constructor(
        private firestore: AngularFirestore
    ) { }

    private collection = this.firestore.collection<Team>('/teams')


    readonly teams$ = this.collection.get().pipe(
        map(({docs}) => docs.map(doc => doc.data() as Team)),
        shareReplay(1)
    )

    teamRef(initials: string) {
        return this.collection.doc<Team>(initials)
    }


    readonly teamByInitial$: Observable<{[intials: string]: Team}> = this.teams$.pipe(
        map(teams => teams.reduce((obj, team) => {
            obj[team.initials] = team
            return obj
        }, {})),
        shareReplay(1)
    )

    team(initials: string) {
        return this.teamByInitial$.pipe(map(teams => teams[initials]))
    }
}
