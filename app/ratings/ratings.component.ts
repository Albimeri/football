import { Component, OnInit } from "@angular/core";
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";
import { PromptData } from "../prompt-dialog/prompt-dialog.data";
import { HomeService } from "../home/home.service";
import { CommonService } from "../common/common.service";
import { adminsEnum } from "../constants/enums";

@Component({
  selector: "app-ratings",
  templateUrl: "./ratings.component.html",
  styleUrls: ["./ratings.component.css"],
})
export class RatingsComponent implements OnInit {
  users: any = [];
  isDataLoded: boolean;
  userId: string;
  emailAddress: string;
  displayName: string;
  isLoading: boolean;
  promptDataLogOut: PromptData;
  isAdmin: boolean;
  showRatings: boolean;
  heartIcons = {
    empty: "../../assets/star_border-24px.svg",
    half: "../../assets/star_half-24px.svg",
    full: "../../assets/star-24px.svg",
  };
  me: any;

  constructor(
    private _db: AngularFireDatabase,
    private _auth: AngularFireAuth,
    private _router: Router,
    private _homeService: HomeService,
    private _commonService: CommonService
  ) {
    this.isLoading = true;
    this.promptDataLogOut = new PromptData(
      "Europa League",
      "Are you sure you want to Log Out?",
      "Log Out",
      "danger",
      "Yes"
    );
    this._db
      .list("/users")
      .valueChanges()
      .subscribe((res) => {
        let response = res as any;
        this.me = response.find((user) => user.UserId === this.userId);
        this.isLoading = false;
        let priviledged = response.filter((item) => item.CanRate);
        this.users = response.sort((a, b) => {
          let average1 = this._commonService.calculateRating(a, priviledged);
          let average2 = this._commonService.calculateRating(b, priviledged);
          return average1 < average2 ? 1 : -1;
        });
        if (
          this.me &&
          this.me.CanRate &&
          this._commonService.checkForAngryRating(this.users, this.userId)
        ) {
          this._router.navigateByUrl("/ratings");
          alert(
            "You cannot rate 2.5 points below or above than the average of the player!"
          );
          this.showRatings = true;
        }
      });
  }

  ngOnInit() {
    this._auth.authState.subscribe((res) => {
      this.isAdmin = adminsEnum.includes(res.email);
      this.isDataLoded = true;
      if (!res || !res.emailVerified) {
        this._router.navigateByUrl("/login");
        return;
      }
      this.userId = res.uid;
      this.emailAddress = res.email;
      this.displayName = res.displayName;
    });
  }

  getPlayerRating(player) {
    if (!player.Rating) {
      return null;
    }
    let foundPlayer = player.Rating.find((item) => item.Key === this.userId);
    if (foundPlayer) {
      return foundPlayer.Value;
    }
    return null;
  }

  ratePlayer(rating, player) {
    if (player.UserId === this.userId) {
      return;
    }
    let ratingAvg = this._commonService.calculateRating(
      player,
      this.getPriviledgedUsers()
    );
    if (
      (player.CanRate && ratingAvg && ratingAvg < rating - 2.5) ||
      ratingAvg > rating + 2.5
    ) {
      alert(
        "You cannot rate 2.5 points below or above than the average of the player!"
      );
      return;
    }
    let ratingObj = {
      Key: this.userId,
      Value: rating,
    };
    if (!player.Rating) {
      player.Rating = [ratingObj];
      this._homeService.addUser(player);
      return;
    }
    let indexFound = player.Rating.findIndex(
      (item) => item.Key === this.userId
    );
    let userIndex = this.users.findIndex(
      (item) => item.UserId === player.UserId
    );
    if (indexFound === -1) {
      player.Rating.push(ratingObj);
      this.users[userIndex] = player;
      this._homeService.addUser(player);
    } else {
      player.Rating[indexFound].Value = rating;
      this.users[userIndex] = player;
      this._homeService.addUser(player);
    }
  }

  getPriviledgedUsers(): any[] {
    return this.users.filter((item) => item.CanRate);
  }

  getPlayers(): any[] {
    let users = this.users.filter((user) => user.Role === 1 && !user.IsGuest);
    return users;
  }

  getGoalKeepers(): any[] {
    return this.users.filter((user) => user.Role === 0 && !user.IsGuest);
  }

  logOutPrompt(result): void {
    if (result === "Yes") {
      this.logout();
    }
  }

  logout(): any {
    return this._auth.auth.signOut().then((user) => {});
  }

  setRatePrivilage(canRate, player) {
    player.CanRate = canRate;
    this._homeService.addUser(player);
  }

  checkLocation(location): boolean {
    return window.location.href.indexOf(location) > -1;
  }
}
