import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import PouchDB from 'pouchdb';

import { TrackPage } from '../track/track';
import { DetailPage } from '../detail/detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
  history: any = [];
  localDatabase: any;

  constructor(public navCtrl: NavController, private platform: Platform, private androidPermissions: AndroidPermissions) {}
  
  ionViewDidLoad() {
	this.localDatabase = new PouchDB("local_database");
	this.localDatabase.replicate.from(DATABASE_URL + '\' + DATABASE_NAME).on("complete", () => {
	  this.readHistoryData();
	});
  }
  
  ionViewDidEnter() {
	this.readHistoryData();
  }

  onTrackClick() {
	if (this.platform.is("android")) {
		
	  this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
	    result => {
		  if (result.hasPermission) {
			this.navCtrl.push(TrackPage, {});
		  } else {
			this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
		  }
		},
	    err => { this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION); }
	  );
	} else {
	  this.navCtrl.push(TrackPage, {});
    }
  }

  onItemClick(data) {
    this.navCtrl.push(DetailPage, { data: data });
  }
  
  readHistoryData() {	  
	this.localDatabase.allDocs({ include_docs: true }).then((result) => {
	  
	  if (result.rows.length != this.history.length) {
	    this.history = [];
	  
	    for(let i = 0; i < result.rows.length; i++) {
		  this.history.push(result.rows[i].doc);
	    }
	  }
	});
  }
}
