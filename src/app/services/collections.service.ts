import { Injectable } from '@angular/core'
import { map, shareReplay } from 'rxjs/operators'

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import 'firebase/firestore'


export interface Team {
    name: string,
    initials: string
}


@Injectable({
    providedIn: 'root'
})
export class CollectionsService {

    private _teamsCol = this._store.collection('/teams') as AngularFirestoreCollection<Team>

    readonly teams$ = this._teamsCol.get().pipe(
        map(teams => teams.docs.map(doc => doc.data() as Team)),
        shareReplay(1)
    )

    constructor(
        private _store: AngularFirestore
    ) { }

    team(initials: string) {
        return this._teamsCol.doc<Team>(initials)
    }
}
