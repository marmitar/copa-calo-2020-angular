import { Injectable } from '@angular/core'
import { TeamsService } from '$$/teams.service'
import { UsersService } from '$$/users.service'
import { map, exhaustMap, shareReplay, retryWhen, delay, take } from 'rxjs/operators'

import { AngularFireFunctions } from '@angular/fire/functions'
import { AngularFirestore } from '@angular/fire/firestore'
import 'firebase/firestore'


export type ReducedAthlete = Reduced<Athlete, 'team', 'initials'>


@Injectable({
    providedIn: 'root'
})
export class AthletesService {

    constructor(
        private firestore: AngularFirestore,
        private teams: TeamsService,
        private fns: AngularFireFunctions,
        private users: UsersService
    ) { }

    private collection = this.firestore.collection<ReducedAthlete>('/athletes')

    readonly athletes$ = this.teams.teamByInitial$.pipe(
        exhaustMap(teams => this.collection.valueChanges().pipe(
            map(athletes => athletes.map(athlete => {
                const team = teams[athlete.team]
                return Object.assign(athlete, { team }) as Athlete
            }))
        )),
        shareReplay(1)
    )

    find(filter: FilterFn<Athlete>, sort?: CompareFn<Athlete>) {
        return this.athletes$.pipe(
            map(athletes => {
                if (sort) {
                    return athletes.filter(filter).sort(sort)
                } else {
                    return athletes.filter(filter)
                }
            })
        )
    }

    async createAthletes(...athletes: ReducedAthlete[]) {
        const fun = this.fns.httpsCallable('createAthletes')
        await fun(athletes).pipe(
            this.users.requireRole('dm'),
            retryWhen(errors => errors.pipe(delay(1000), take(2)))
        ).toPromise()
    }
}
