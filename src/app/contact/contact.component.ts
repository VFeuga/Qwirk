import { Component, OnInit, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { ChatsService } from '../chats.service';
import { AuthenticationService } from '../authentication.service';
import { UsersService } from '../users.service';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  contacts: any[] = [];
  //0 = see
  //1 = create
  mode: number = 0;
  allUsers: any[] = [];
  userDisplayed: any = {
    nom: "",
    prenom: "",
    bio: "",
    email: "",
    photo: ""
  };
  filtreText : string = "";
  allUsersWithoutFiltre: any = [];
  @Output() created: EventEmitter<any> = new EventEmitter<any>();

  constructor(private chatsService: ChatsService, overlay: Overlay, vcRef: ViewContainerRef, public modal: Modal, private auth: AuthenticationService, private usersServices: UsersService) {
    let that = this;
    overlay.defaultViewContainer = vcRef;



    this.getAllUser();
    this.getContact();
  }

  getContact() {
    let idUser = this.auth.getUserID();
    let that = this;
    this.chatsService.getContact(idUser, function (data) {

      that.contacts = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].id != idUser) {
          that.contacts.push(data[i]);
        }
      }
    });

  }
  filtre(){
   
    this.allUsers = [];
    for(var i = 0; i < this.allUsersWithoutFiltre.length; i++){
      if(this.allUsersWithoutFiltre[i].nom.indexOf(this.filtreText) > -1 || this.allUsersWithoutFiltre[i].prenom.indexOf(this.filtreText) > -1){
        this.allUsers.push(this.allUsersWithoutFiltre[i]);
      }
    }
  }

  getAllUser() {
    let idUser = this.auth.getUserID();
    let that = this;
    this.usersServices.getAllUser(idUser, function (data) {
      that.allUsers = data;
      that.allUsersWithoutFiltre = data;
    });
  }
  startChat(id: number) {
    let that = this;
    that.created.emit(id);
  }

  deleteContact(id: number) {
    let that = this;

    this.usersServices.deleteContact(id, function (data) {

      that.getContact();
    });

  }

  toAddContact() {
    this.mode = 1;
    this.getAllUser();
  }

  toSeeContact() {
    this.mode = 0;
  }

  seeProfil(id: number) {
    this.mode = 2;
    let that = this;
    this.usersServices.getUser(id, function (data) {
      if (data.photo == null) {
        data.photo = "";
      }
      that.userDisplayed = data;
    });

  }

  invite(id: number,nom:string,prenom:string) {
    let idUser = this.auth.getUserID();
    let that = this;
    let user = this.auth.getUser();
    let libelle = user.nom + " " +user.prenom+" - " + nom +" " +prenom;
    this.chatsService.inviteContact(libelle, "Discution privée "+libelle, idUser, id, function (data) {
      if (!data) return;
      else {
        that.getAllUser();
        that.modal.alert()
          .size('sm')
          .isBlocking(false)
          .showClose(false)
          .keyboard(27)
          .title('Informations')
          .body('Utilisateurs invité, il doit encore accepté votre invitation avant d\'aparaitre dans votre liste de contact')
          .open();

      }
    });
  }
  ngOnInit() {
  }

}
