import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Geolocation, Coordinates } from '@ionic-native/geolocation';
import { GoogleMap, GoogleMaps, LocationService } from '@ionic-native/google-maps';
import PouchDB from 'pouchdb';

import { DetailPage } from '../detail/detail';

@Component({
  selector: 'page-track',
  templateUrl: 'track.html'
})
export class TrackPage {
  
  isTrackingReady: boolean = false;
  isTrackingStarted: boolean = false;
  isTrackingFinished: boolean = false;
  
  distance: number = 0;
  startCoordinate: Coordinates = null;
  finishCoordinate: Coordinates = null;
  geolocator: any;
  map: GoogleMap;
  
  duration: Date = new Date(0);
  startTime: number = 0;
  timer: any;

  constructor(public navCtrl: NavController, private geolocation: Geolocation) {}
  
  ionViewDidLoad() {	
	this.map = GoogleMaps.create('map_canvas', {
	  controls: { 
	    myLocation: true,
		myLocationButton: false
      },
	  gestures: {
		rotate: false,
		scroll: false,
		zoom: false,
		tilt: false
	  },
	});
	  
	LocationService.getMyLocation().then((location) => {
	  this.map.moveCamera({ zoom: 15, target: location.latLng });	
	  this.isTrackingReady = true;
	});
  }

  onStartClick() {
	this.isTrackingStarted = true;
	
	this.startTime = Date.now();
	this.startTimerUpdate();
	
	this.geolocator = this.geolocation.watchPosition({
	  enableHighAccuracy: true
	}).subscribe(data => {
	  if (data.coords !== undefined) {
		let previousCoordinate: Coordinates = this.finishCoordinate;
		this.finishCoordinate = data.coords;
		
		if (this.startCoordinate === null) {
			this.startCoordinate = this.finishCoordinate;
		}
		
		this.map.moveCamera({ zoom: 15, target: {
		  lat: this.finishCoordinate.latitude,
          lng: this.finishCoordinate.longitude		  
		}});	
		
		if (previousCoordinate !== null) {
			this.distance = this.calculateDistance(previousCoordinate, this.finishCoordinate);
		}
	  }
	});
	this.map = GoogleMaps.create('map_canvas');
  }

  onStopClick() {
	this.isTrackingFinished = true;
	
	clearInterval(this.timer);
	this.geolocator.unsubscribe();
  }
  
  onResetClick() {
	this.isTrackingStarted = false;
	this.isTrackingFinished = false;
  
	this.distance = 0
    this.duration = new Date(0)
	this.startCoordinate = null;
	this.finishCoordinate = null;
  }
  
  onSaveClick() {
	let runData = {
	  date: this.startTime,
	  distance: this.distance,
	  duration: this.duration.getTime(),
	  start: { 
	    latitude: this.startCoordinate.latitude,
		longitude: this.startCoordinate.longitude
	  },
	  finish: {
	    latitude: this.finishCoordinate.latitude,
		longitude: this.finishCoordinate.longitude
	  }
	};	
	
	let localDatabase = new PouchDB("local_database");
	localDatabase.post(runData).then(() => {
	  localDatabase.replicate.to(DATABASE_URL + '\' + DATABASE_NAME);
	  
	  this.navCtrl.pop();
      this.navCtrl.push(DetailPage, { data: runData });
	});
  }
  
  startTimerUpdate() {
    this.timer = setTimeout(() => {	  	
	  this.duration = new Date(Date.now() - this.startTime);	  
      this.startTimerUpdate();	  
    }, 30);
  }
  
  calculateDistance(coordinate1: Coordinates, coordinate2: Coordinates) {
	var radlat1 = Math.PI * coordinate1.latitude / 180
	var radlat2 = Math.PI * coordinate2.latitude / 180
	var theta = coordinate1.longitude - coordinate2.longitude
	var radtheta = Math.PI * theta / 180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	dist = dist * 1.609344
	return dist
  }
}
