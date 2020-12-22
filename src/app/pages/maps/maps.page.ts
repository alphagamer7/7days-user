import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { GoogleMapsService } from './map.service';
declare var google;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;
  map_model: any;
  geocoder: any;
  lat: any;
  lng: any;
  marker: any;
  constructor(
    private geolocationProvider: Geolocation,
    private utilService: UtilService,
    private ngZone: NgZone,
    private mapService: GoogleMapsService,
    private router: Router,
    public modalController: ModalController
  ) {
    this.geolocationProvider = geolocationProvider;
    this.utilService = utilService;
    this.ngZone = ngZone;
    this.mapService = mapService;
    this.map_model = {
      search_query: '',
      search_places_predictions: [],
      using_geolocation: false,
    };
    this.geocoder = new google.maps.Geocoder();
  }

  getCurrentLocation() {
    this.geolocationProvider
      .getCurrentPosition({
        maximumAge: 1000,
        timeout: 5000,
        enableHighAccuracy: true,
      })
      .then((resp) => {
        console.log(resp);
        this.lat = resp.coords.latitude;
        this.lng = resp.coords.longitude;

        this.initialize();
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });
  }
  ngOnInit() {
    console.log('logged');
    // setTimeout(() => {
    this.getCurrentLocation();
    // }, 1000);
  }

  //set map variables
  initialize() {
    // let latLng = new google.maps.LatLng(this.lat, this.lng);
    let latLng = new google.maps.LatLng(this.lat, this.lng);
    let mapOptions = {
      center: latLng,
      zoom: 19,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDefaultUI: true,
    };

    this.geocoder.geocode(
      {
        latLng: latLng,
      },
      (results, status) => {
        console.log(results);

        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results);
          this.geoEncodePlace(results[0]);
        }
      }
    );
    this.ngZone.run(() => {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    });
    console.log(this.map);
    this.marker = new google.maps.Marker({
      map: this.map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: latLng,
      raiseOnDrag: false,
    });
    this.marker.setIcon(this.createIcon());
    google.maps.event.addListener(this.marker, 'dragend', () => {
      this.geocodePosition(this.marker.getPosition());
    });
  }

  geocodePosition(pos) {
    console.log(pos);
    this.geocoder.geocode(
      {
        latLng: pos,
      },
      (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          console.log(results);
          this.geoEncodePlace(results[0]);
          //   this.mapService.geocodePlace(results[0].place_id).subscribe(
          //     (place_location) => {
          //       console.log(place_location);
          //       this.marker.setPosition(place_location);
          //       this.map_model.search_query = results[0].formatted_address;
          //     },
          //     (e) => {
          //       console.log("onError: %s", e);
          //     },
          //     () => {
          //       console.log("onCompleted");
          //     }
          //   );
        } else {
          // $('#mapErrorMsg')
          //   .html('Cannot determine address at this location.' + status)
          //   .show(100);
        }
      }
    );
  }

  geoEncodePlace(result) {
    this.mapService.geocodePlace(result.place_id).subscribe(
      (place_location) => {
        console.log(place_location);
        this.marker.setPosition(place_location);
        this.map_model.search_query = this.getMinifiedAddress(result);
        console.log('search query', this.map_model.search_query);
      },
      (e) => {
        console.log('onError: %s', e);
      },
      () => {
        console.log('onCompleted');
      }
    );
  }

  getMinifiedAddress(address) {
    let addressVal = '';
    address.address_components.map((element, index) => {
      if (index <= 3) {
        addressVal += element.short_name + ' ';
      }
    });
    console.log('addressVal', addressVal);
    return addressVal;
  }

  clearSearch() {
    let env = this;
  }

  back() {
    this.modalController.dismiss({
      location: '',
    });
  }

  createIcon() {
    let _icon = {
      path:
        'M144 400c80 0 144 -60 144 -134c0 -104 -144 -282 -144 -282s-144 178 -144 282c0 74 64 134 144 134zM144 209c26 0 47 21 47 47s-21 47 -47 47s-47 -21 -47 -47s21 -47 47 -47z',
      fillColor: '#45C261',
      fillOpacity: 0.6,
      anchor: new google.maps.Point(0, 0),
      strokeWeight: 0,
      scale: 0.08,
      rotation: 180,
    };
    return _icon;
  }

  geolocateMe() {
    this.utilService.show('Loading...');
    this.geolocationProvider
      .getCurrentPosition({
        maximumAge: 1000,
        timeout: 5000,
        enableHighAccuracy: true,
      })
      .then((position) => {
        console.log('position', position);
        let current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.geocoder.geocode(
          {
            latLng: current_location,
          },
          (results, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
              console.log(results);
              this.geoEncodePlace(results[0]);
              //   this.mapService.geocodePlace(results[0].place_id).subscribe(
              //     (place_location) => {
              //       console.log(place_location);
              //       this.marker.setPosition(place_location);
              //       this.map.setCenter(this.marker.getPosition());
              //       this.map_model.search_query = results[0].formatted_address;
              //     },
              //     (e) => {
              //       console.log("onError: %s", e);
              //     },
              //     () => {
              //       console.log("onCompleted");
              //     }
              //   );
            } else {
              // $('#mapErrorMsg')
              //   .html('Cannot determine address at this location.' + status)
              //   .show(100);
            }
          }
        );
        // this.map_model.search_query = position.coords.latitude.toFixed(2) + ', ' + position.coords.longitude.toFixed(2);
        // this.marker.setPosition(current_location);
        // this.map.setCenter(this.marker.getPosition());
        // env.setOrigin(current_location);
        this.map_model.using_geolocation = true;
        this.utilService.hide();
      })
      .catch((error) => {
        console.log('Error getting location', error);
        this.utilService.hide();
      });
  }

  selectAddress() {
    // this.router.navigate(['add-address'], {
    //   queryParams: { location: this.map_model.search_query },
    // });

    this.modalController.dismiss({
      location: this.map_model.search_query,
    });
  }

  searchPlacesPredictions(query) {
    let env = this;
    if (query !== '') {
      this.mapService.getPlacePredictions(query).subscribe(
        (places_predictions) => {
          console.log(places_predictions);
          env.map_model.search_places_predictions = places_predictions;
        },
        (e) => {
          console.log('onError: %s', e);
        },
        () => {
          console.log('onCompleted');
        }
      );
    } else {
      env.map_model.search_places_predictions = [];
    }
  }

  selectSearchResult(place) {
    let env = this;
    console.log(place);
    env.map_model.search_query = place.description;
    env.map_model.search_places_predictions = [];
    // We need to get the location from this place. Let's geocode this place!
    this.mapService.geocodePlace(place.place_id).subscribe(
      (place_location) => {
        console.log(place_location);
        this.marker.setPosition(place_location);
        this.map.setCenter(this.marker.getPosition());
        // env.setOrigin(place_location);
      },
      (e) => {
        console.log('onError: %s', e);
      },
      () => {
        console.log('onCompleted');
      }
    );
  }
}
