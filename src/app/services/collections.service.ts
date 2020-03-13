import { Injectable } from '@angular/core'

import { Observable, combineLatest } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { AngularFirestore } from '@angular/fire/firestore'
import 'firebase/firestore'


export interface Team {
    name: string,
    initials: string,
    logoUrl: string
}

export interface TeamsByInitials {
    [intials: string]: Team
}

export const enum Sex {
    FEM = "feminino",
    MASC = "masculino"
}

export interface Athlete {
    name: string
    rg: string
    rgOrgao: string

    sex: Sex
    team: Team['initials'] | Team
}


@Injectable({
    providedIn: 'root'
})
export class CollectionsService {

    private teamsCol = this.firestore.collection<Team>('/teams')
    private atlCol = this.firestore.collection<Athlete>('/athletes')

    readonly teams$ = this.teamsCol.get().pipe(
        map(teams => teams.docs.map(doc => doc.data() as Team)),
        shareReplay(1)
    )
    readonly teamByInitial$: Observable<TeamsByInitials> = this.teams$.pipe(
        map(teams => teams.reduce((obj, team) => {
            obj[team.initials] = team
            return obj
        }, {}))
    )
    readonly athletes$ = combineLatest(this.teamByInitial$, this.atlCol.valueChanges()).pipe(
        map(([teams, atls]) => atls.map(atl => {
            atl.team = teams[atl.team as string]
            return atl
        }))
    )

    constructor(private firestore: AngularFirestore) { }

    team(initials: string) {
        return this.teamsCol.doc<Team>(initials)
    }

    async addAthlete(athlete: Athlete) {
        if (typeof athlete.team !== 'string') {
            athlete.team = athlete.team.initials
        }
        await this.atlCol.add(athlete)
    }
}
