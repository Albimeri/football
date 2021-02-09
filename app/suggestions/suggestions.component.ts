import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { HomeService } from '../home/home.service';
import { CommonService } from '../common/common.service';

@Component({ selector: 'app-suggestions', templateUrl: './suggestions.component.html', styleUrls: ['./suggestions.component.css'] })
export class SuggestionsComponent implements OnInit {

    users: any = [];
    filteredUsers: any = [];
    isDataLoded: boolean;
    userId: string;
    emailAddress: string;
    displayName: string;
    isLoading: boolean;
    suggestions: any = [];
    writtingMode: boolean;
    searchValue: string = '';
    selectedPlayer: any;
    suggestion: string = '';
    submitWarning: boolean;
    canSuggest: boolean;
    me: any;

    constructor(private _db: AngularFireDatabase,
        private _auth: AngularFireAuth,
        private _router: Router,
        private _homeService: HomeService,
        private _commonService: CommonService) {
        this.isLoading = true;
        this.submitWarning = this.suggestion.length <= 10;
    }

    ngOnInit() {
        this._auth.authState.subscribe(res => {
            if (!res || !res.emailVerified) {
                this._router.navigateByUrl('/login');
                return;
            }
            this.userId = res.uid;
        });

        this._db.list('/users').valueChanges().subscribe(res => {
            let response = (res as any); 
            this.me = response.find(user => user.UserId === this.userId);
            this.canSuggest = this.me && this.me.CanSuggest;
            this.users = response.filter(item => item.CanSuggest);
            this.filteredUsers = JSON.parse(JSON.stringify(this.users));
            this.isLoading = false;
            this.isDataLoded = true; 
            if (!this.me) {
                this.suggestions = []; 
            } else {
                this.suggestions = this.me.Suggestions || [];
                this.suggestions.forEach(suggestion => {
                    suggestion.IsRead = true;
                });
                this._commonService.reOrderList(this.suggestions, 'D', 'FullDate'); 
                this._homeService.addUser(this.me);
            } 
        });
    }

    newSuggestion(): void {
        this.writtingMode = true;
    }

    filterPlayers(searchValue) {
        this.filteredUsers = this.users.filter(item => {
            return item.DisplayName.toLowerCase().includes(searchValue.toLowerCase()) || item.DisplayName.toLowerCase().trim() === searchValue.toLowerCase().trim();
        });
    }

    selectPlayer(player): void {
        this.selectedPlayer = player;
        this.writtingMode = true;
    }

    back(): void {
        this.writtingMode = false;
        this.filteredUsers = this.users;
    }

    submit(): void {
        if (this.suggestion.length < 10) {
            return;
        }
        let suggestion = {
            Key: this._commonService.generateId(),
            Value: this.suggestion,
            FullDate: this._commonService.getFullDate(),
            IsRead: false
        }
        if (this.selectedPlayer.Suggestions) {
            this.selectedPlayer.Suggestions.push(suggestion);
        } else {
            this.selectedPlayer.Suggestions = [suggestion];
        }
        this._homeService.addUser(this.selectedPlayer);
        this.writtingMode = false;
        this.suggestion = '';
    }

    validateSubmit(event): void {
        this.submitWarning = event.length <= 10;
        this.suggestion = event;
    }

    setSuggestionPrililage(event) {
        this.canSuggest = event;
        this.me.CanSuggest = event;
        this._homeService.addUser(this.me);
    }

    removeSuggestion(suggestion): void {
        let indexFound = this.me.Suggestions.findIndex(item => item.Key === suggestion.Key);
        this.me.Suggestions.splice(indexFound, 1);
        this._homeService.addUser(this.me);
    }

}
