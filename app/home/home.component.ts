import { Component, OnInit } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";
import { HomeService } from "./home.service";
import { PromptData } from "../prompt-dialog/prompt-dialog.data";
import { CommonService } from "../common/common.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  users: any = [];
  isDataLoded: boolean;
  userId: string;
  emailAddress: string;
  displayName: string;
  isLoading: boolean;
  team1: any[] = [];
  team2: any[] = [];
  isAdmin: boolean;
  setDate: string;
  showCountDown: boolean;
  matchDay: string;
  matchDayInt: number; // tuesday
  matchHoursInt: number = 18;
  statusDayInt: number = 1; // monday
  countDownDate: string;
  promptDataLogOut: PromptData;
  days: any = [
    {
      Description: "Monday",
      Key: 1,
    },
    {
      Description: "Tuesday",
      Key: 2,
    },
    {
      Description: "Wednesday",
      Key: 3,
    },
    {
      Description: "Thursday",
      Key: 4,
    },
    {
      Description: "Friday",
      Key: 5,
    },
    {
      Description: "Saturday",
      Key: 6,
    },
    {
      Description: "Sunday",
      Key: 7,
    },
  ];
  hours: any = [
    {
      Description: "17:00",
      Key: 17,
    },
    {
      Description: "18:00",
      Key: 18,
    },
    {
      Description: "19:00",
      Key: 19,
    },
    {
      Description: "20:00",
      Key: 20,
    },
    {
      Description: "21:00",
      Key: 21,
    },
    {
      Description: "22:00",
      Key: 22,
    },
    {
      Description: "23:00",
      Key: 23,
    },
    {
      Description: "00:00",
      Key: 24,
    },
  ];
  fields: any = [
    {
      Coordinations: "42.661585, 21.187517",
      Description: "Prishtina",
      Key: 1,
    },
    {
      Coordinations: "42.674183, 21.133837",
      Description: "Ylli",
      Key: 2,
    },
    {
      Coordinations: "42.674183, 21.133837",
      Description: "Princi",
      Key: 3,
    },
  ];
  roles: any = [
    {
      Description: "Goal Keeper",
      Key: 0,
    },
    {
      Description: "Player",
      Key: 1,
    },
  ];
  selectedFieldKey: number = 1;
  selectedRoleInt: number = 1;
  selectedField: any = this.fields[0];
  newPlayerName: string;
  newPlayerRole: number = 1;
  me: any;
  inUsers: any[] = [];
  canSetStatus: boolean;

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
  }

  ngOnInit() {
    this._auth.authState.subscribe((res) => {
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

      this._db
        .list("/users")
        .valueChanges()
        .subscribe((res) => {
          this.isDataLoded = true;
          let response = res as any;
          this.me = response.find((user) => user.UserId === this.userId);
          this.users = response;
          // user.Status 1 = IN, user.Status 0 = Not set,  user.Status 2 = Out
          this.inUsers = this.users.filter((item) => item.Status === 1);
          this.isLoading = false;
          this.setColorToPlayers();
          if (
            this.me &&
            this.me.CanRate &&
            this._commonService.checkForAngryRating(this.users, this.userId)
          ) {
            this._router.navigateByUrl("/ratings");
          }
        });

      this._homeService
        .getTeams()
        .valueChanges()
        .subscribe((teams) => {
          this.team1 = teams.filter((item) => item.Team === 1);
          this.team2 = teams.filter((item) => item.Team === 2);
          this.team1.sort((a, b) =>
            this._commonService.calculateRating(a, this.getPriviledgedUsers()) >
            this._commonService.calculateRating(b, this.getPriviledgedUsers())
              ? -1
              : 1
          );
          this.team1.sort((a, b) => (a.Role === 1 ? 1 : -1));
          this.team2.sort((a, b) =>
            this._commonService.calculateRating(a, this.getPriviledgedUsers()) >
            this._commonService.calculateRating(b, this.getPriviledgedUsers())
              ? -1
              : 1
          );
          this.team2.sort((a, b) => (a.Role === 1 ? 1 : -1));
          (this.team1 as any).Average = this._commonService.getTeamAverage(
            this.team1,
            this.users
          );
          (this.team2 as any).Average = this._commonService.getTeamAverage(
            this.team2,
            this.users
          );
        });

      this._homeService
        .getDay()
        .valueChanges()
        .subscribe((matchDay) => {
          this.matchDayInt = +matchDay as any;
          const {
            matchDateString,
            matchDate,
          } = this._commonService.getMatchDateFormatted(
            this.matchDayInt,
            this.matchHoursInt
          );
          this.matchDay = matchDateString;
          this.canSetStatus = this.canSetDateFunc(matchDate);
        });

      this._homeService
        .getHour()
        .valueChanges()
        .subscribe((matchHour) => {
          this.matchHoursInt = +matchHour as any;
          const {
            matchDateString,
            matchDate,
          } = this._commonService.getMatchDateFormatted(
            this.matchDayInt,
            this.matchHoursInt
          );
          this.matchDay = matchDateString;
          this.canSetStatus = this.canSetDateFunc(matchDate);
        });

      this._homeService
        .getField()
        .valueChanges()
        .subscribe((field) => {
          this.selectedFieldKey = field as any;
          this.selectedField = this.fields.find(
            (item) => item.Key === +this.selectedFieldKey
          );
        });
    });
  }

  canSetDateFunc(matchDate): boolean {
    const dateNow = new Date();
    debugger;
    if (
      this.matchDayInt === dateNow.getDay() &&
      dateNow.getHours() >= this.matchHoursInt
    ) {
      return false;
    }
    return matchDate.getDate() - 2 <= dateNow.getDate();
  }

  sortList(list): any {
    list.sort((a, b) => {
      let d1 = new Date(a.FullDate),
        d2 = new Date(b.FullDate);
      return d1 > d2 ? 1 : -1;
    });
    return list;
  }

  setColorToPlayers(): void {
    let totalInPlayers = 0;
    let totalInGoalKeepers = 0;
    let goalKeepers = this.users.filter((user) => user.Role === 0);
    let players = this.users.filter((user) => user.Role === 1);
    this.sortList(goalKeepers);
    this.sortList(players);

    players.forEach((user) => {
      if (user.Status === 1 && totalInPlayers < 10) {
        totalInPlayers++;
        user.Color = "colorgreen";
      } else {
        user.Color = "colorred";
      }
    });
    goalKeepers.forEach((user) => {
      if (user.Status === 1 && totalInGoalKeepers < 2) {
        totalInGoalKeepers++;
        user.Color = "colorgreen";
      } else {
        user.Color = "colorred";
      }
    });
  }

  canOverrideStatus(status): boolean {
    let date = new Date();
    if (
      this.matchDayInt === date.getDay() &&
      date.getHours() > this.matchHoursInt
    ) {
      return true;
    }
    let player = this.users.find((item) => item.Email === this.emailAddress);
    return player && player.Status === status;
  }

  setStatus(status: number): void {
    // user.Status 1 = IN, user.Status 0 = Not set, user.Status 2 = Out
    let date = new Date();
    if (this.canOverrideStatus(status)) {
      return;
    }
    this.inUsers = this.users.filter((item) => item.Status === 1);
    let team =
      this.inUsers.length % 2 === 0 && this.inUsers.length !== 0 ? 1 : 2;
    let userFound = this.users.find((item) => item.UserId === this.userId);

    if (userFound && userFound.SuspendedDate) {
      if (+new Date(userFound.SuspendedDate) < +date) {
        userFound.IsBanned = false;
        userFound.SuspendedDate = null;
      }
    }

    if (userFound && userFound.IsBanned) {
      alert("You've been banned for 1 game!");
      let matchDate = this._commonService.getMatchDate(
        this.matchDayInt,
        this.matchHoursInt
      );
      userFound.SuspendedDate = userFound.SuspendedDate
        ? userFound.SuspendedDate
        : matchDate.toISOString();
      this._homeService.addUser(userFound);
      return;
    }

    if (!userFound) {
      let newUser = this._commonService.setNewUser(
        status,
        team,
        this.displayName,
        this.selectedRoleInt,
        this.emailAddress,
        this.userId
      );
      this._homeService.addUser(newUser);
    } else {
      userFound.Status = status;
      userFound.Role = +this.selectedRoleInt;
      userFound.FullDate = this._commonService.getFullDate();
      this._homeService.addUser(userFound);
    }
    this._commonService.reOrderList(this.inUsers, "D", "FullDate");
    this._commonService.reOrderList(this.users, "D", "FullDate");
  }

  setRole(role: number): void {
    this.selectedRoleInt = role;
  }

  deleteAllActions(): void {
    let usersToSet = new Object();
    let users = this.users.filter((user) => !user.IsGuest);
    users.forEach((user) => {
      user.Status = 0;
      usersToSet[user.UserId] = user;
    });
    this._homeService.setUsers(usersToSet);
  }

  logout(): any {
    return this._auth.auth.signOut();
  }

  initTeams(): void {
    this.team1 = [];
    this.team2 = [];
    let inUsers = JSON.parse(JSON.stringify(this.inUsers));
    let players = inUsers.filter((player) => player.Role === 1);
    let goalKeepers = inUsers.filter((player) => player.Role === 0);
    this._commonService.reOrderList(players, "D", "FullDate");
    let limitedPlayersNumber = 12 - goalKeepers.length;
    players = players.splice(
      0,
      players.length > limitedPlayersNumber
        ? limitedPlayersNumber
        : players.length
    );
    goalKeepers.sort((a, b) => {
      let average1 = this._commonService.calculateRating(
        a,
        this.getPriviledgedUsers()
      );
      let average2 = this._commonService.calculateRating(
        b,
        this.getPriviledgedUsers()
      );
      return average1 < average2 ? 1 : -1;
    });
    goalKeepers.forEach((goalKeeper, index) => {
      let team = (index + 1) % 2 === 0 ? 1 : 2;
      goalKeeper.Team = team;
      team === 1 ? this.team1.push(goalKeeper) : this.team2.push(goalKeeper);
    });

    players.sort((a, b) =>
      this._commonService.calculateRating(a, this.getPriviledgedUsers()) <
        this._commonService.calculateRating(b, this.getPriviledgedUsers()) ||
      +a.Role === 0
        ? 1
        : -1
    );
    this.seperatePlayers(players);
  }

  seperatePlayers(players): void {
    let team1 = {
      Key: 1,
      playersToAdd: 1,
    };
    let team2 = {
      Key: 2,
      playersToAdd: 2,
    };
    let turnToAdd = 1;
    for (let i = 0; i < players.length; i++) {
      if (turnToAdd === 1) {
        players[i].Team = 1;
        if (team1.playersToAdd === 2) {
          if (players.length - 1 === i) {
            this.team1.push(players[i]);
          } else {
            players[i + 1].Team = 1;
            this.team1.push(players[i]);
            this.team1.push(players[i + 1]);
            i++;
          }
          team1.playersToAdd = 1;
        } else {
          players[i].Team = 1;
          this.team1.push(players[i]);
          team1.playersToAdd = 2;
        }
      }
      if (turnToAdd === 2) {
        if (team2.playersToAdd === 2) {
          players[i].Team = 2;
          if (players.length - 1 === i) {
            this.team2.push(players[i]);
          } else {
            players[i + 1].Team = 2;
            this.team2.push(players[i]);
            this.team2.push(players[i + 1]);
            i++;
          }
          team2.playersToAdd = 1;
        } else {
          players[i].Team = 2;
          this.team2.push(players[i]);
          team2.playersToAdd = 2;
        }
      }
      turnToAdd = turnToAdd === 2 ? 1 : 2;
    }
    (this.team1 as any).Average = this._commonService.getTeamAverage(
      this.team1,
      this.users
    );
    (this.team2 as any).Average = this._commonService.getTeamAverage(
      this.team2,
      this.users
    );
  }

  setTeams(): void {
    let teams = this.team1.concat(this.team2);
    this._homeService.setTeams(teams);
  }

  getUsersWithStatus() {
    this._commonService.reOrderList(this.users, "D", "FullDate");
    return this.users.filter((user) => user.Status !== 0 && user.Role === 1);
  }

  getGoalKeepersWithStatus() {
    this._commonService.reOrderList(this.users, "D", "FullDate");
    return this.users.filter((user) => user.Status !== 0 && user.Role === 0);
  }

  getInGoalKeepers(): number {
    this._commonService.reOrderList(this.inUsers, "D", "FullDate");
    return this.inUsers
      ? this.inUsers.filter((user) => user.Status !== 0 && user.Role === 0)
          .length
      : 0;
  }

  getInPlayers(): number {
    this._commonService.reOrderList(this.inUsers, "D", "FullDate");
    return this.inUsers
      ? this.inUsers.filter((user) => user.Status !== 0 && user.Role === 1)
          .length
      : 0;
  }

  deleteTeams(): void {
    this._homeService.deleteTeams();
    this.team1 = [];
    this.team2 = [];
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

  changeSelectedRole(field): void {
    this._homeService.setField(field);
  }

  openWindow(url) {
    window.open("https://www.google.com/maps/place/" + url, "_blank");
  }

  getPriviledgedUsers(): any[] {
    return this.users.filter((item) => item.CanRate);
  }
}
