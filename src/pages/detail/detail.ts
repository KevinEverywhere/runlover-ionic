import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GoogleMap, GoogleMaps } from '@ionic-native/google-maps';

@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html'
})
export class DetailPage {
	
  date: Date;
  distance: number;
  duration: Date;
  startCoordinate: any;
  finishCoordinate: any;
  
  map: GoogleMap;

  constructor(public navCtrl: NavController, private navParams: NavParams) {
	let data = navParams.get('data');
	
	this.date = new Date(data.date);
	this.distance = data.distance;
	this.duration = new Date(data.duration);
	this.startCoordinate = data.start;
	this.finishCoordinate = data.finish;
  }
  
  ionViewDidLoad() {
	this.map = GoogleMaps.create('map_canvas', {
	  controls: { 
	    myLocation: false,
		myLocationButton: false
      },
	  gestures: {
		rotate: false,
		scroll: false,
		zoom: false,
		tilt: false
	  },
	});
	
	this.map.moveCamera({ zoom: 15, target: {
	  lat: (this.startCoordinate.latitude + this.finishCoordinate.latitude) / 2,
	  lng: (this.startCoordinate.longitude + this.finishCoordinate.longitude) / 2
	}});	
	
	this.map.addMarker({
		position: { 
		  lat: this.startCoordinate.latitude, 
		  lng: this.startCoordinate.longitude 
		}
	});
	
	this.map.addMarker({
		position: { 
		  lat: this.finishCoordinate.latitude, 
		  lng: this.finishCoordinate.longitude 
		}
	});
  }
}
