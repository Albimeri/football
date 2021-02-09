import { Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Action } from '../home/home';
import { CommonService } from '../common/common.service';

@Component({
  selector: 'drag-and-drop',
  templateUrl: 'drag-and-drop.component.html',
  styleUrls: ['drag-and-drop.component.css'],
})
export class CdkDragDropConnectedSortingExample {
  @Input() users = [];
  @Input() team1 = [];
  @Input() team2 = [];
  @Input() isAdmin;

  constructor(private _commonService: CommonService) {

  }

  drop(event: CdkDragDrop<string[]>) {
    if (!this.isAdmin) {
      return;
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
      let item: Action = event.container.data[event.currentIndex] as any; 
      item.Team = item.Team !== 1 ? 1 : 2;
      (this.team1 as any).Average = this._commonService.getTeamAverage(this.team1, this.users);
      (this.team2 as any).Average = this._commonService.getTeamAverage(this.team2, this.users);
    }
  }

}