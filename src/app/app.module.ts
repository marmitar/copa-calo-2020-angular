import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'

import { AppComponent } from '#/app.component'
import { AppRoutingModule } from '#/app-routing.module'
import { environment } from '##/environments/environment'
import { MatModule } from '#/mat.module'

import { NavbarComponent } from '$/navbar/navbar.component'
import { LoginComponent, LoginDialogComponent } from '$/login/login.component'
import { AdminComponent } from '$/admin/admin.component'
import { AdminUsersComponent } from '$/admin/users/users.component'
import { AdminTeamsComponent } from '$/admin/teams/teams.component'

import { ReactiveFormsModule } from '@angular/forms'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFireFunctionsModule } from '@angular/fire/functions'


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        LoginComponent,
        LoginDialogComponent,
        AdminComponent,
        AdminUsersComponent,
        AdminTeamsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        CommonModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireFunctionsModule,
        BrowserAnimationsModule,
        MatModule
    ],
    providers: environment.providers,
    bootstrap: [AppComponent]
})
export class AppModule { }
