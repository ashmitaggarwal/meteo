import {Component, OnInit, NgZone, ViewChild} from "@angular/core";
import {ViewController, NavParams} from "ionic-angular";
import * as _ from "lodash";
import {Location} from "../providers";

@Component({
  templateUrl: 'location.html'
})
export class ModalLocation implements OnInit {
  @ViewChild('searchInput') searchInput;
  heading: string;
  autocompleteItems: Array<{description: string,place_id: string}>;
  query: string;
  acService: any;
  locationObj: Location;

  constructor(public viewCtrl: ViewController,
              public zone: NgZone,
              public params: NavParams) {
  }

  ionViewDidEnter() {
    this.searchInput.setFocus();
  }

  ngOnInit() {
    this.acService = new google.maps.places.AutocompleteService();
    this.autocompleteItems = [];
    this.query = '';
    this.locationObj = {
      name: null,
      lat: null,
      lng: null
    };
    this.heading = this.params.get('heading') ? this.params.get('heading') : 'Search City Name';
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateSearch() {
    console.debug("modal > updateSearch > query ", this.query);
    if (this.query.trim() == '') {
      this.autocompleteItems = [];
      return;
    }
    let self = this;
    let config = {
      types: ['(cities)'],
      input: this.query
    };
    this.acService.getPlacePredictions(config, (predictions, status)=> {
      console.debug('modal > getPlacePredictions > status > ', status);
      self.zone.run(() => {
        self.autocompleteItems = predictions ? predictions : [];
      });
    });
  }

  chooseItem(item) {
    let self = this;
    let request = {
      placeId: item.place_id
    };
    let response:Location;
    let placesService = new google.maps.places.PlacesService(document.createElement('div'));
    placesService.getDetails(request, (place, status)=> {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        console.debug('page > getPlaceDetail > place > ', place);
        self.locationObj.lat = place.geometry.location.lat();
        self.locationObj.lng = place.geometry.location.lng();
        let obj = _.find(place.address_components, ['types[0]', 'locality']);
        if (obj) {
          self.locationObj.name = obj['short_name'];
        }
        response = self.locationObj;
      } else {
        console.debug('page > getPlaceDetail > status > ', status);
      }
      self.zone.run(() => {
        self.viewCtrl.dismiss(response);
      });
    });
  }
}