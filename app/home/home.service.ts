import { Injectable } from "../../../node_modules/@angular/core";
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase, AngularFireList, snapshotChanges, AngularFireObject } from 'angularfire2/database';

class Item {
    body: string;
}

@Injectable()
export class HomeService {

    userId: string;
    items: AngularFireList<Item>;
    teams: AngularFireList<Item>;
    users: AngularFireList<Item>;
    state: AngularFireObject<Item>;

    constructor(private _db: AngularFireDatabase, private _auth: AngularFireAuth,
        private afs: AngularFirestore) { 
    } 
    
    getUsers(): any {
        this.users = this._db.list(`users`)
        return this.users;
    }

    addUser(player: any) { 
        this._db.object(`users/${player.UserId}`).set(player);
    } 

    setUsers(users){
        this._db.object(`users`).set(users);
    } 
    
    removeUser(player: any) { 
       this._db.object(`users/${player.UserId}`).remove(); 
    } 

    getActionsList(): any {
        this.items = this._db.list(`actions`)
        return this.items;
    } 

    getTeams(): any {
        this.teams = this._db.list(`teams`)
        return this.teams;
    }

    setTeams(teams: any[]): any {
        this._db.list(`teams`).remove().then(res=>{ 
            teams.forEach(item => {
                this._db.object(`teams/${item.UserId}`).set(item);
            });
        }); 
    }

    addPlayerToTeam(player: any, team: number) {
        player.Team = team;
        this._db.object(`teams/${player.UserId}`).set(player);
    }

    deleteAllActions(): any {
        this._db.list(`actions`).remove();
    }

    deleteTeams(): any {
        this._db.list(`teams`).remove();
    }

    setUserAction(actionObj: any) {
        this._db.object(`actions/${actionObj.UserId}`).set(actionObj);
    }

    setState(date: any) {
        this._db.object(`state`).set(date);
    }

    setDay(day: number) {
        this._db.object(`selectedDay`).set(+day);
    }

    getDay() {
        return this._db.object(`selectedDay`);
    }

    setHour(hour: number) {
        this._db.object(`selectedHour`).set(hour);
    }

    getHour() {
        return this._db.object(`selectedHour`);
    }

    setField(field: any) { 
        this._db.object(`selectedField`).set(field);
    }

    getField() {
        return this._db.object(`selectedField`);
    }

    getState(): any {
        this.state = this._db.object(`state`);
        return this.state
    }
 
    
}