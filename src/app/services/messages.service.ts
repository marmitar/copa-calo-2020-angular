import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { environment } from '##/environments/environment'


@Injectable({
    providedIn: 'root'
})
export class MessagesService {
    constructor(private _snackBar: MatSnackBar) { }

    private _log(data?: any) {
        if (!environment.production && data !== undefined) {
            console.log(data)
        }
    }

    private async _open(message: string, duration: number, ...cls: string[]) {
        const ref = this._snackBar.open(message, 'Fechar', {
            duration,
            panelClass: cls
        })

        await ref.afterDismissed().toPromise()
    }

    async error<T>(msg: String | string, source?: T, duration = 5000) {
        this._log(source)
        await this._open(msg.toString(), duration, 'message-error')
    }

    async hint(msg: String | string, duration = 2500) {
        await this._open(msg.toString(), duration, 'message-hint')
    }
}
