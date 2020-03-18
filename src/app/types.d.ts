declare type Role = {
    role?: 'admin' | 'none' | 'arb'
    team?: undefined
} | {
    role: 'dm',
    team: Team
}

declare type User = Role & {email: string}


declare interface Team {
    name: string,
    initials: string,
    logoUrl: string
}

declare interface Athlete {
    name: string
    rg: string
    rgOrgao: string

    sex: 'fem' | 'masc'
    team: Team
}

declare type Reduced<T, K extends keyof T, S extends keyof T[K]> = {
    [P in keyof T]: P extends K? T[P][S] : T[P]
}

declare const enum Ord { Lt = -1, Eq = 0, Gt = 1 }
declare type CompareFn<T> = (a: T, b: T) => Ord

/** Keep when true */
declare type FilterFn<T> = (x: T) => boolean
