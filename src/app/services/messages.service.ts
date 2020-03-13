import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { environment } from '##/environments/environment'


@Injectable({
    providedIn: 'root'
})
export class MessagesService {
    constructor(private _snackBar: MatSnackBar) { }

    async error<T>(msg: String | string, source?: T, duration = 5000) {
        this.debug(source)
        await this.open(msg.toString(), duration, 'message-error')
    }

    async hint(msg: String | string, duration = 2500) {
        await this.open(msg.toString(), duration, 'message-hint')
    }

    async open(message: string, duration: number, ...cls: string[]) {
        const ref = this._snackBar.open(message, 'Fechar', {
            duration,
            panelClass: cls
        })

        await ref.afterDismissed().toPromise()
    }

    debug(data?: any) {
        if (!environment.production) {
            console.log(data)
        }
    }
}
