/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : ionic 5 groceryee app
  Created : 10-Sep-2020
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2020-present initappz.
*/
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Geolocation, GeolocationOptions, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';
import { NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
declare var google;

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.page.html',
  styleUrls: ['./add-address.page.scss'],
})
export class AddAddressPage implements OnInit {
  @ViewChild('map', { static: true }) mapEle: ElementRef;
  map: any;
  marker: any;
  lat: any;
  lng: any;
  address: any = '';
  house: any = '';
  landmark: any = '';
  title: any = 'home';
  pincode: any = '';
  id: any;
  from: any;
  constructor(
    public geolocation: Geolocation,
    private navCtrl: NavController,
    private api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute
  ) {

    this.route.queryParams.subscribe(data => {
      console.log(data);
      if (data && data.from) {
        this.from = 'edit';
        const info = JSON.parse(data.data);
        console.log('da===>', info);
        this.address = info.address;
        this.house = info.house;
        this.id = info.id;
        this.landmark = info.landmark;
        this.lat = info.lat;
        this.lng = info.lng;
        this.pincode = info.pincode;
      } else {
        this.from = 'new';
      }
    });
  }

  ngOnInit() {
  }

  addAddress() {
    if (this.address === '' || this.landmark === '' || this.house === '' || this.pincode === '') {

      this.util.errorToast(this.util.getString('All Fields are required'));
      return false;
    }
    if (!this.lat || this.lat === '' || !this.lng || this.lng === '') {
      const geocoder = new google.maps.Geocoder;
      geocoder.geocode({ address: this.house + ' ' + this.landmark + ' ' + this.address + ' ' + this.pincode }, (results, status) => {
        console.log(results, status);
        if (status === 'OK' && results && results.length) {
          this.lat = results[0].geometry.location.lat();
          this.lng = results[0].geometry.location.lng();
          console.log('----->', this.lat, this.lng);
          console.log('call api');
          this.util.show();
          const param = {
            uid: localStorage.getItem('uid'),
            address: this.address,
            lat: this.lat,
            lng: this.lng,
            title: this.title,
            house: this.house,
            landmark: this.landmark,
            pincode: this.pincode
          };
          this.api.post('address/save', param).subscribe((data: any) => {
            this.util.hide();
            if (data && data.status === 200) {
              this.util.publishNewAddress();
              this.navCtrl.back();
              this.util.showToast('Address added', 'success', 'bottom');
            } else {
              this.util.errorToast(this.util.getString('Something went wrong'));
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.errorToast(this.util.getString('Something went wrong'));
          });
        } else {
          this.util.errorToast(this.util.getString('Something went wrong'));
          return false;
        }
      });
    }


  }

  updateAddress() {
    if (this.address === '' || this.landmark === '' || this.house === '' || this.pincode === '') {
      this.util.errorToast(this.util.getString('All Fields are required'));
      return false;
    }
    if (!this.lat || this.lat === '' || !this.lng || this.lng === '') {
      const geocoder = new google.maps.Geocoder;
      geocoder.geocode({ address: this.house + ' ' + this.landmark + ' ' + this.address + ' ' + this.pincode }, (results, status) => {
        console.log(results, status);
        if (status === 'OK' && results && results.length) {
          this.lat = results[0].geometry.location.lat();
          this.lng = results[0].geometry.location.lng();
          console.log('----->', this.lat, this.lng);
          const param = {
            id: this.id,
            uid: localStorage.getItem('uid'),
            address: this.address,
            lat: this.lat,
            lng: this.lng,
            title: this.title,
            house: this.house,
            landmark: this.landmark,
            pincode: this.pincode
          };
          this.util.show();
          this.api.post('address/editList', param).subscribe((data: any) => {
            this.util.hide();
            if (data && data.status === 200) {
              this.util.publishNewAddress();
              this.navCtrl.back();
              this.util.showToast('Address updated', 'success', 'bottom');
            } else {
              this.util.errorToast(this.util.getString('Something went wrong'));
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.errorToast(this.util.getString('Something went wrong'));
          });
        } else {
          this.util.errorToast(this.util.getString('Something went wrong'));
          return false;
        }
      });
    }


  }

  back() {
    this.navCtrl.back();
  }
}
