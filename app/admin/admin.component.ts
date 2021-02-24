import { Component, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";
import { HomeService } from "../home/home.service";
import { PromptData } from "../prompt-dialog/prompt-dialog.data";
import {
  fieldsEnum,
  ratesEnum,
  rolesEnum,
  hoursEnum,
  daysEnum,
  adminsEnum,
} from "../constants/enums";

@Component({ selector: "app-admin", templateUrl: "./admin.component.html" })
export class AdminComponent implements OnInit {
  users: any = [];
  filteredUsers: any = [];
  isDataLoded: boolean;
  userId: string;
  emailAddress: string;
  displayName: string;
  isLoading: boolean;
  totalInPlayers: number;
  actions: any[] = [];
  team1: any[] = [];
  team2: any[] = [];
  isAdmin: boolean;
  setDate: string;
  canSetStatus: boolean = true;
  showCountDown: boolean;
  matchDay: string;
  matchDayInt: number; // tuesday
  matchHoursInt: number = 18;
  countDownDate: string;
  promptDataBanPlayer: PromptData;
  days: any = daysEnum;
  hours: any = hoursEnum;
  roles: any = rolesEnum;
  selectedFieldKey: number = 1;
  fields = fieldsEnum;
  selectedField: any = fieldsEnum[0];
  newPlayerName: string = "";
  newPlayerRole: number = 1;
  newPlayerRate: number = 5;
  successNewPlayer: boolean;
  rates: number[] = ratesEnum;

  constructor(
    private _db: AngularFireDatabase,
    private _auth: AngularFireAuth,
    private _router: Router,
    private _homeService: HomeService
  ) {
    this.isLoading = true;
    this._db
      .list("/users")
      .valueChanges()
      .subscribe((res) => {
        this.users = res;
        this.filteredUsers = JSON.parse(JSON.stringify(this.users));
      });
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
      this.isAdmin = adminsEnum.includes(res.email);

      this._homeService
        .getDay()
        .valueChanges()
        .subscribe((matchDay) => {
          this.matchDayInt = matchDay as any;
          this.matchDay = this.getMatchDate();
        });

      this._homeService
        .getHour()
        .valueChanges()
        .subscribe((matchHour) => {
          this.matchHoursInt = +matchHour as any;
          this.matchDay = this.getMatchDate();
        });
      this._homeService
        .getField()
        .valueChanges()
        .subscribe((field) => {
          this.selectedFieldKey = field as any;
          this.selectedField = fieldsEnum.find(
            (item) => item.Key === +this.selectedFieldKey
          );
        });
    });
  }

  getMatchDate(): string {
    let daysToAdd =
        new Date().getDay() <= this.matchDayInt
          ? this.matchDayInt - new Date().getDay()
          : 7 - new Date().getDay() + this.matchDayInt,
      matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + daysToAdd);
    matchDate.setHours(this.matchHoursInt);

    let index = matchDate
        .toUTCString()
        .indexOf(new Date().getFullYear().toString()),
      date = matchDate.toUTCString().substring(0, index);
    return matchDate.getHours() + ":00 " + date.trim();
  }

  setNewUser(team) {
    let user = Object() as any;
    user.DisplayName = this.newPlayerName;
    user.Role = +this.newPlayerRole;
    user.UserId = this.generateId();
    user.Status = 1;
    user.Team = team;
    user.FullDate = this.getFullDate();
    user.IsGuest = true;
    user.Rating = [{ Key: this.userId, Value: +this.newPlayerRate }];
    return user;
  }

  getFullDate(): string {
    let date = new Date();
    let fullDate =
      date.toLocaleDateString() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds() +
      ":" +
      date.getUTCMilliseconds();
    return fullDate;
  }

  addNewPlayer(): void {
    let actionsFiltered = this.actions.filter((item) => item.Status);
    let team =
      actionsFiltered.length % 2 === 0 && actionsFiltered.length !== 0 ? 1 : 2;
    let newUser = this.setNewUser(team);
    this._homeService.addUser(newUser);
    this.successNewPlayer = true;
  }

  setRole(role: number): void {
    this.newPlayerRole = role;
  }

  deleteAllActions(): void {
    this._homeService.deleteAllActions();
  }

  changeSelectedDay(day): void {
    this._homeService.setDay(day);
  }

  changeSelectedHour(hour): void {
    this._homeService.setHour(hour);
  }

  changeSelectedField(field): void {
    this._homeService.setField(field);
  }

  generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  openWindow(url) {
    window.open("https://www.google.com/maps/place/" + url, "_blank");
  }

  checkLocation(location): boolean {
    return window.location.href.indexOf(location) > -1;
  }

  toggleIsBannedPlayer(player) {
    player.IsBanned = !player.IsBanned;
    player.SuspendedDate = null;
    player.Status = 2;
    player.BannedTimes = player.IsBanned
      ? player.BannedTimes + 1
      : player.BannedTimes;
    this._homeService.addUser(player);
  }

  filterPlayers(searchValue) {
    this.filteredUsers = this.users.filter((item) => {
      return (
        item.DisplayName.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.DisplayName.toLowerCase().trim() ===
          searchValue.toLowerCase().trim()
      );
    });
  }
}
