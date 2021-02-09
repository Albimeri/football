import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PromptData } from '../prompt-dialog/prompt-dialog.data';

@Component({
  selector: 'prompt-dialog',
  templateUrl: './prompt-dialog.component.html',
  styleUrls: ['./prompt-dialog.component.css']
})
export class PromptDialogComponent implements OnInit {

  @Output() onSave = new EventEmitter<string>();
  @Input() promptData: PromptData;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  save(modal: any) {
    modal.close();
  }


  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'basic-modal-title' }).result.then((result) => {
      this.onSave.emit('Yes');
    }, (reason) => {
      this.onSave.emit('No');
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
}

