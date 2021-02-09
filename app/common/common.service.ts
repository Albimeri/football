import { Injectable } from "../../../node_modules/@angular/core";

@Injectable()
export class CommonService {
  reOrderList(list: any, type: string, property: string): any {
    // type = A (Ascending), type = D (Descending)
    list.sort((a, b) => {
      const d1 = new Date(a[property]),
        d2 = new Date(b[property]);
      if (type === "A") {
        return d1 > d2 ? -1 : 1;
      } else {
        return d1 < d2 ? -1 : 1;
      }
    });
  }

  generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
  }

  getMatchDateFormatted(matchDay: number, matchHours: number): any {
    let daysToAdd =
        new Date().getDay() <= matchDay
          ? matchDay - new Date().getDay()
          : 7 - new Date().getDay() + matchDay,
      matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + daysToAdd);
    matchDate.setHours(matchHours);
    let index = matchDate
        .toUTCString()
        .indexOf(new Date().getFullYear().toString()),
      date = matchDate.toUTCString().substring(0, index);
    return {
      matchDate,
      matchDateString: matchDate.getHours() + ":00 " + date.trim(),
    };
  }

  getMatchDate(matchDay: number, matchHours: number): Date {
    let daysToAdd =
        new Date().getDay() <= matchDay
          ? matchDay - new Date().getDay()
          : 7 - new Date().getDay() + matchDay,
      matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + daysToAdd);
    matchDate.setHours(matchHours);
    matchDate.setMinutes(0);
    return matchDate;
  }

  getTeamAverage(team, users): number {
    let sum = 0;
    let priviledgedPlayers = team.filter(
      (player) => player.CanRate || player.IsGuest
    );
    priviledgedPlayers.forEach((player) => {
      let ratingAvg = this.calculateRating(
        player,
        users.filter((player) => player.CanRate)
      );
      sum += ratingAvg;
    });
    return sum / priviledgedPlayers.length;
  }

  checkForAngryRating(users, userId): boolean {
    let isAngryRating = false;
    let priviledgedPlayers = users.filter((player) => player.CanRate);
    users.forEach((user) => {
      user.Rating = user.Rating ? user.Rating : [];
      let rating = user.Rating.find((rating) => rating.Key === userId);
      if (rating) {
        let ratingAvg = this.calculateRating(user, priviledgedPlayers);
        if (ratingAvg < rating.Value - 2.5 || ratingAvg > rating.Value + 2.5) {
          isAngryRating = true;
        }
      }
    });
    return isAngryRating;
  }

  setNewUser(
    status,
    team,
    displayName,
    selectedRoleInt,
    emailAddress,
    userId
  ): Object {
    let user = Object() as any;
    user.DisplayName = displayName;
    user.Role = +selectedRoleInt;
    user.Email = emailAddress;
    user.UserId = userId;
    user.Status = status ? 1 : 2;
    user.Team = team;
    user.CanSuggest = true;
    user.FullDate = this.getFullDate();
    user.IsBanned = false;
    user.CanRate = false;
    user.BannedTimes = 0;
    return user;
  }

  getFullDate(): string {
    let date = new Date();
    let fullDate =
      (date.getMonth() + 1).toString() +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds() +
      ":" +
      date.getMilliseconds();
    return fullDate;
  }

  arraysMatch(arr1, arr2): boolean {
    if (arr1.length !== arr2.length) return false;
    // Check if all items exist and are in the same order
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    // Otherwise, return true
    return true;
  }

  calculateRating(player, usersWhoCanRate) {
    let ratingArr = player && player.Rating ? player.Rating : [];
    let result = 0;
    let canRateCount = 0;
    usersWhoCanRate.forEach((user) => {
      let currentUser = ratingArr.find((item) => user.UserId === item.Key);
      if (currentUser) {
        canRateCount++;
        result += currentUser.Value;
      }
    });
    if (canRateCount === 0) {
      return canRateCount;
    }
    result = result / canRateCount;
    return result;
  }
}
