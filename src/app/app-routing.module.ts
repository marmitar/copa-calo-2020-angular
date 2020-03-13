import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { canActivate, customClaims } from '@angular/fire/auth-guard'
import { pipe } from 'rxjs'
import { map } from 'rxjs/operators'

import { AdminComponent } from '$/admin/admin.component'
import { AthletesCreateComponent } from '$/athletes/create/create.component'


const adminOnly = () => pipe(customClaims, map(claims => claims?.role === 'admin'))

const routes: Routes = [
    { path: '', component: AthletesCreateComponent },
    { path: 'admin', component: AdminComponent, ...canActivate(adminOnly) }
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
