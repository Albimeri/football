import { Component, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";
import { PromptData } from "../prompt-dialog/prompt-dialog.data";

@Component({ selector: "app-header", templateUrl: "./header.component.html" })
export class HeaderComponent implements OnInit {
  isDataLoded: boolean;
  userId: string;
  emailAddress: string;
  displayName: string;
  isLoading: boolean;
  isAdmin: boolean;
  promptDataLogOut: PromptData;
  me: any;
  unReadSuggestions: number;
  unRatedPlayers: number;
  users: any;

  constructor(
    private _db: AngularFireDatabase,
    private _auth: AngularFireAuth,
    private _router: Router
  ) {
    this.isLoading = true;
    this.promptDataLogOut = new PromptData(
      "Europa League",
      "Are you sure you want to Log Out?",
      "Log Out",
      "danger",
      "Yes"
    );
  }

  ngOnInit() {
    this._auth.authState.subscribe((res) => {
      this.isDataLoded = true;
      if (!res || !res.emailVerified) {
        this._router.navigateByUrl("/login");
        return;
      }
      this.userId = res.uid;
      this.emailAddress = res.email;
      this.displayName = res.displayName;
      this.isAdmin = [
        "albimeri94@outlook.com",
        "eabdullahu94@gmail.com",
        "muhamed.r.krasniqi@gmail.com",
      ].includes(res.email);
    });

    this._db
      .list("/users")
      .valueChanges()
      .subscribe((res) => {
        this.users = res as any;
        this.me = this.users.find((user) => user.UserId === this.userId);
        this.unReadSuggestions = this.getUnReadSuggestions();
        this.unRatedPlayers = this.getUnRatedPlayers();
      });
  }

  getUnReadSuggestions(): number {
    let unreadSuggestions = 0;
    if (this.me) {
      unreadSuggestions = this.me.Suggestions
        ? this.me.Suggestions.filter((item) => !item.IsRead).length
        : 0;
    }
    return unreadSuggestions;
  }

  getUnRatedPlayers(): number {
    let unRatedPlayers = 0;
    if (this.me) {
      if (!this.me.CanRate) {
        return 0;
      }
      this.users.forEach((user) => {
        if (user.CanRate) {
          let foundUser = user.Rating
            ? user.Rating.find((rating) => rating.Key === this.me.UserId)
            : null;
          if (!foundUser && user.UserId !== this.me.UserId) {
            unRatedPlayers++;
          }
        }
      });
    }
    return unRatedPlayers;
  }

  logout(): any {
    return this._auth.auth.signOut().then((user) => {});
  }

  logOutPrompt(result): void {
    if (result === "Yes") {
      this.logout();
    }
  }

  checkLocation(location): boolean {
    return window.location.href.indexOf(location) > -1;
  }
}
