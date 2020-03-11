import { NgModule } from '@angular/core'

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
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatExpansionModule } from '@angular/material/expansion'


const modules = [
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
    MatSnackBarModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatExpansionModule
]


@NgModule({
    imports: modules,
    exports: modules
})
export class MatModule { }
