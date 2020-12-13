/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : ionic 5 groceryee app
  Created : 10-Sep-2020
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2020-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { VerifyPage } from '../verify/verify.page';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  fname: any = '';
  lname: any = '';
  mobile: any = '';
  gender: any = '1';
  email: any = '';
  password: any = '';
  loggedIn: boolean;
  check: boolean;

  cc: any = '';
  ccCode: any = '';
  countries: any[] = [];
  dummy: any[] = [];
  constructor(
    private navCtrl: NavController,
    public util: UtilService,
    private router: Router,
    private api: ApiService,
    private iab: InAppBrowser,
    private modalCtrl: ModalController
  ) {
    this.dummy = this.util.countrys;
  }

  ngOnInit() {
  }

  async openModal(userId) {
    const modal = await this.modalCtrl.create({
      component: VerifyPage,
      componentProps: { code: this.ccCode, mobile: this.mobile, uid: userId }
    });

    modal.onDidDismiss().then((data: any) => {
      console.log(data);
    });
    modal.present();
  }

  login() {
    console.log('login');
    if (!this.check) {
      this.util.showToast(this.util.getString('Please accept terms and conditions'), 'dark', 'bottom');
      return false;
    }
    if (!this.fname || !this.lname || !this.mobile || !this.email || !this.password || this.ccCode === '' || !this.ccCode) {
      this.util.showToast(this.util.getString('All Fields are required'), 'dark', 'bottom');
      return false;
    }

    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailfilter.test(this.email)) {
      this.util.showToast(this.util.getString('Please enter valid email'), 'dark', 'bottom');
      return false;
    }

    const param = {
      first_name: this.fname,
      last_name: this.lname,
      email: this.email,
      password: this.password,
      gender: this.gender,
      fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : 'NA',
      type: 'user',
      lat: '',
      lng: '',
      cover: 'NA',
      mobile: '+' + this.ccCode + this.mobile,
      status: this.util.twillo === '1' ? 0 : 1,
      verified: 0,
      others: 1,
      date: moment().format('YYYY-MM-DD'),
      stripe_key: ''
    }

    console.log('param', param);
    this.loggedIn = true;
    this.api.post('users/registerUser', param).subscribe((data: any) => {
      this.loggedIn = false;
      console.log(data);
      if (data && data.status === 200) {
        this.util.userInfo = data.data;
        if (this.util.twillo === '1') {
          console.log('open model=>>>');
          localStorage.setItem('uMobile', '+' + this.ccCode + this.mobile);
          this.openModal(data.data.id);
        } else {
          localStorage.setItem('uid', data.data.id);
          const fcm = localStorage.getItem('fcm');
          if (fcm && fcm !== null && fcm !== 'null') {
            const updateParam = {
              id: data.data.id,
              fcm_token: fcm
            };
            this.api.post('users/edit_profile', updateParam).subscribe((data: any) => {
              console.log('user info=>', data);
            }, error => {
              console.log(error);
            });
          }
          this.sendVerification(this.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);
          this.navCtrl.navigateRoot(['']);
        }

      } else if (data && data.status === 500) {
        this.util.errorToast(data.data.message);
      } else {
        this.util.errorToast(this.util.getString('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.loggedIn = false;
      this.util.errorToast(this.util.getString('Something went wrong'));
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  sendVerification(mail, link) {
    const param = {
      email: mail,
      url: link
    };

    this.api.post('users/sendVerificationMail', param).subscribe((data) => {
      console.log('mail', data);
    }, error => {
      console.log(error);
    });
  }

  onCountryInput(events) {
    console.log(events.detail.value);
    if (events.value !== '') {
      this.countries = this.dummy.filter((item) => {
        return item.country_name.toLowerCase().indexOf(events.detail.value.toLowerCase()) > -1;
      });
    } else {
      this.countries = [];
    }
  }

  selectedCC(item) {
    this.countries = [];
    console.log(item);
    this.cc = '+' + item.dialling_code + ' ' + item.country_name;
    this.ccCode = item.dialling_code;
  }

  open(type) {
    // https://initappz.com/groceryeeaagya/privacy.html
    // https://initappz.com/groceryeeaagya/eula.html
    if (type === 'eula') {
      this.iab.create('https://initappz.com/groceryeeaagya/eula.html');
    } else {
      this.iab.create('https://initappz.com/groceryeeaagya/privacy.html');
    }
  }
}
