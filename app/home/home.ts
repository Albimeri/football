export class Action {
    constructor(status: boolean, userId: string, email: string, displayName: string, team: number, role: number, rating: number) {
        let date = new Date();
        this.Status = status;
        this.Date = date.toLocaleDateString();
        this.FullDate = date.toLocaleDateString() + ' ' +
            date.getHours() + ':' +
            date.getMinutes() + ':' +
            date.getSeconds() + ':' +
            date.getUTCMilliseconds();
        this.UserId = userId;
        this.Email = email;
        this.Team = team;
        this.DisplayName = displayName;
        this.Role = role;

    }
    Status: boolean;
    Date: string;
    FullDate: string;
    UserId: string;
    DisplayName: string;
    Email: string;
    Team: number;
    Role: number;
}

export class User {
    constructor() {
        this.Email = '';
        this.Password = '';
        this.FirstName = '';
        this.LastName = '';
    }
    Email: string;
    Password: string;
    FirstName: string;
    LastName: string;
}
