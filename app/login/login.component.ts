import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../home/home';

class Error {
  code: string;
  message: string;
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  isDataLoded: boolean;
  viewType: string; // L - Login, S - SignUp , VS - verification from signup , VL - verification from login
  user: User;
  errorObj: Error;
  hasErrors: boolean;

  constructor(private _auth: AngularFireAuth, private _router: Router) {
    this.user = new User();
    this.viewType = 'L';
    this.errorObj = new Error();
  }

  ngOnInit() {
    this._auth.authState.subscribe(res => {
      this.isDataLoded = true;
      if (res && res.emailVerified) {
        this._router.navigateByUrl('');
      }
      // if (res && !res.emailVerified) {
      //   this.viewType = 'VS';
      // }
    });
  }

  login() {
    if (this.user.Email === '' && this.user.Password === '') {
      this.validateEmptyFileds();
      return;
    }
    return this._auth.auth.signInWithEmailAndPassword(this.user.Email, this.user.Password)
      .then(res => {
        if (res.user.emailVerified) {
          this._router.navigateByUrl('');
        } else {
          this.viewType = 'VL';
        }
      }).catch(error => { 
        this.hasErrors = true;
        this.errorObj = error;
      });
  }

  signUp() {
    if (this.user.Email === '' && this.user.Password === '') {
      this.validateEmptyFileds();
      return;
    }
    return this._auth.auth.createUserWithEmailAndPassword(this.user.Email, this.user.Password)
      .then(res => {

        res.user.sendEmailVerification();
        let displayName = this.user.FirstName + " " + this.user.LastName,
          profileData = { displayName: displayName, photoURL: '' };
        res.user.updateProfile(profileData);
        this.viewType = 'VS';
        this._auth.auth.signOut();
      }).catch(error => { 
        this.hasErrors = true;
        this.errorObj = error;
      });;
  }

  validateEmptyFileds(): void {
    this.hasErrors = true;
    this.errorObj = new Error();
    this.errorObj.message = 'Email and password are required'
  }

  resetUser(): void {
    this.hasErrors = false;
    this.user = new User();
  }



}
