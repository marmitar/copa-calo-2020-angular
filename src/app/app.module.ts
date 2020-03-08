import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { CommonModule } from '@angular/common'

import { AppComponent } from '#/app.component'
import { AppRoutingModule } from '#/app-routing.module'
import { environment } from '##/environments/environment'

import { NavbarComponent } from '$/navbar/navbar.component'
import { LoginComponent, LoginDialogComponent } from '$/login/login.component'
import { AdminComponent } from '$/admin/admin.component'

import { ReactiveFormsModule } from '@angular/forms'
import { AngularFireModule } from '@angular/fire'
import { AngularFireAuthModule } from '@angular/fire/auth'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { AngularFireFunctionsModule } from '@angular/fire/functions'

import { LayoutModule } from '@angular/cdk/layout'
import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatRadioModule } from '@angular/material/radio'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatTabsModule } from '@angular/material/tabs'
import { MatSnackBarModule } from '@angular/material/snack-bar'


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        LoginComponent,
        LoginDialogComponent,
        AdminComponent
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
        LayoutModule,
        OverlayModule,
        PortalModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCardModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatSnackBarModule
    ],
    providers: [environment.functions],
    bootstrap: [AppComponent]
})
export class AppModule { }
