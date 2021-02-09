import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';

@Component({ selector: 'app-rules', templateUrl: './rules.component.html' })
export class RulesComponent implements OnInit { 

    constructor(private _auth: AngularFireAuth, private _router: Router) { } 

    isDataLoded: boolean;

    ngOnInit() {
        this._auth.authState.subscribe(res => {

            if (!res || !res.emailVerified) {
                this._router.navigateByUrl('/login');
                return;
            }
            this.isDataLoded = true;
        });
    }

}
