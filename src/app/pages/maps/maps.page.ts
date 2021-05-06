import { Component, ElementRef, NgZone, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { GoogleMapsService } from './map.service';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
declare var google;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
})
export class MapsPage implements OnInit, AfterViewInit {
  @ViewChild('mapSe', { static: true }) mapEle: ElementRef;
  map: any;
  map_model: any;
  geocoder: any;
  lat: any;
  lng: any;
  marker: any;
  address: any;
  isOptionHidden: boolean = true;
  title: any;
  description: any = '';
  constructor(
    // private geolocationProvider: Geolocation,
    public geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private utilService: UtilService,
    private api: ApiService,
    private ngZone: NgZone,
    private mapService: GoogleMapsService,
    private router: Router,
    public modalController: ModalController,
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic
  ) {
    // this.geolocationProvider = geolocationProvider;
    // this.utilService = utilService;
    // this.ngZone = ngZone;
    // this.mapService = mapService;
    this.map_model = {
      search_query: '',
      search_places_predictions: [],
      using_geolocation: false,
      minifiedAddress: '',
    };
    this.isOptionHidden = true;
    // this.geocoder = new google.maps.Geocoder();
  }

  getCurrentLocation() {
    this.geolocation
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
    // this.getCurrentLocation();
    // }, 1000);
    this.getLocation();
    document.getElementById('map').style.height = this.platform.height() - 62 + 'px';
  }

  ngAfterViewInit() {
    this.isOptionHidden = true;
    document.querySelector<HTMLElement>('.hd').style.display = 'block';
    document.querySelector<HTMLElement>('.bdn').style.display = 'block';
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
      this.map = new google.maps.Map(this.mapEle.nativeElement, mapOptions);
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
        this.address = result;
        this.map_model.search_query = result.formatted_address;
        this.map_model.minifiedAddress = this.getMinifiedAddress();
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

  getMinifiedAddress() {
    let addressVal = '';
    if (this.address)
      this.address.address_components.map((element, index) => {
        if (index <= 1) {
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
    this.geolocation
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
  searchAddress(event) {
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };
    this.nativeGeocoder
      .forwardGeocode(event.target.value, options)
      .then((result: NativeGeocoderResult[]) => {
        let location = new google.maps.LatLng(result[0].latitude, result[0].longitude);
        this.map.setCenter(new google.maps.LatLng(result[0].latitude, result[0].longitude));
        this.addMarker(location);
      })
      .catch((error: any) => console.log(error));
  }
  getLocation() {
    this.utilService.show();
    this.platform.ready().then(() => {
      if (this.platform.is('android')) {
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION).then(
          (result) => console.log('Has permission?', result.hasPermission),
          (err) => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION)
        );
        this.grantRequest();
      } else if (this.platform.is('ios')) {
        this.grantRequest();
      } else {
        this.geolocation
          .getCurrentPosition({
            maximumAge: 3000,
            timeout: 10000,
            enableHighAccuracy: false,
          })
          .then((resp) => {
            if (resp) {
              this.lat = resp.coords.latitude;
              this.lng = resp.coords.longitude;
              if (!this.map) this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
              this.getAddress(this.lat, this.lng);
            }
            this.utilService.hide();
          });
      }
    });
  }
  grantRequest() {
    this.diagnostic
      .isLocationEnabled()
      .then(
        (data) => {
          if (data) {
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  console.log('resp', resp);
                  if (!this.map) this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
                  const location = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
                  this.map.setCenter(new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude));
                  this.addMarker(location);
                  this.getAddress(resp.coords.latitude, resp.coords.longitude);
                }
              });
          } else {
            this.diagnostic.switchToLocationSettings();
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  console.log('ress,', resp);
                  if (!this.map) this.loadmap(resp.coords.latitude, resp.coords.longitude, this.mapEle);
                  this.getAddress(resp.coords.latitude, resp.coords.longitude);
                }
              });
          }
          this.utilService.hide();
        },
        (error) => {
          this.utilService.hide();
        }
      )
      .catch((error) => {
        if (!this.map) this.loadmap(0, 0, this.mapEle);
      });
  }
  loadmap(lat, lng, mapElement) {
    const location = new google.maps.LatLng(lat, lng);
    const style = [
      {
        featureType: 'all',
        elementType: 'all',
        stylers: [{ saturation: -100 }],
      },
    ];

    const mapOptions = {
      zoom: 15,
      scaleControl: false,
      streetViewControl: false,
      zoomControl: false,
      overviewMapControl: false,
      center: location,
      mapTypeControl: false,
      mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'fire5'],
      },
    };
    this.map = new google.maps.Map(mapElement.nativeElement, mapOptions);
    var mapType = new google.maps.StyledMapType(style, { name: 'Grayscale' });
    this.map.mapTypes.set('fire5', mapType);
    this.map.setMapTypeId('fire5');
    this.map.setCenter(new google.maps.LatLng(lat, lng));
    this.addMarker(location);
  }
  getAddress(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(lat, lng);
    geocoder.geocode({ location: location }, (results, status) => {
      console.log(results);
      this.geoEncodePlace(results[0]);
      this.address = results[0];
      this.lat = lat;
      this.lng = lng;
    });
  }
  addMarker(location) {
    if (this.marker) this.marker.setMap(null);
    console.log('location =>', location);
    const icon = {
      url: 'assets/imgs/pin.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
    };
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: this.createIcon(),
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    google.maps.event.addListener(this.marker, 'addfeature', () => {
      debugger;
      console.log(this.marker);
      this.getDragAddress(this.marker);
    });
    google.maps.event.addListener(this.marker, 'dragend', () => {
      console.log(this.marker);
      this.getDragAddress(this.marker);
    });
  }
  getDragAddress(event) {
    const geocoder = new google.maps.Geocoder();
    const location = new google.maps.LatLng(event.position.lat(), event.position.lng());
    geocoder.geocode({ location: location }, (results, status) => {
      console.log(results);
      this.geoEncodePlace(results[0]);
      this.address = results[0];
      this.lat = event.position.lat();
      this.lng = event.position.lng();
    });
  }
  showAddressOptions() {
    this.isOptionHidden = !this.isOptionHidden;
  }
  addNewAddress() {
    if (!this.title || this.description == '') {
      this.utilService.errorToast(this.utilService.getString('الرجاء ملىء كافة المعلومات'));
      return;
    }
    const uid = localStorage.getItem('uid');
    if (uid == null || uid == 'null') {
      this.modalController.dismiss({
        location: '',
        reload: false,
        login: true,
      });
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: this.map_model.search_query,
      },
      (results, status) => {
        if (status === 'OK' && results && results.length) {
          this.lat = results[0].geometry.location.lat();
          this.lng = results[0].geometry.location.lng();
          this.utilService.show();
          const param = {
            uid: localStorage.getItem('uid'),
            address: this.map_model.search_query,
            lat: this.lat,
            lng: this.lng,
            title: this.title,
            house: '',
            landmark: this.description,
            pincode: '',
          };
          this.api.post('address/save', param).subscribe(
            (data: any) => {
              this.utilService.hide();
              if (data && data.status === 200) {
                this.utilService.publishNewAddress();
                this.utilService.showToast('Address added', 'success', 'bottom');
                this.showAddressOptions();
                this.modalController.dismiss({
                  location: param.address,
                  reload: true,
                });
              } else {
                this.utilService.errorToast(this.utilService.getString('Something went wrong'));
              }
            },
            (error) => {
              console.log(error);
              this.utilService.hide();
              this.utilService.errorToast(this.utilService.getString('Something went wrong'));
            }
          );
        } else {
          this.utilService.errorToast(this.utilService.getString('Something went wrong'));
          return false;
        }
      }
    );
  }
  radioGroupChange(event) {
    this.title = event.target.value;
  }
}
