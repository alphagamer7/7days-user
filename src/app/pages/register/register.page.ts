/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : ionic 5 groceryee app
  Created : 10-Sep-2020
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2020-present initappz.
*/
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavController, IonContent } from '@ionic/angular';
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
  @ViewChild(IonContent) content: IonContent;

  scrollToTop() {
    this.content.scrollToTop(400);
  }
  fname: any = '';
  lname: any = '';
  mobile: any = 'test';
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
    private modalCtrl: ModalController,
    private ngZone: NgZone
  ) {
    this.dummy = this.util.countrys;
    this.selectedCC({
      country_code: 'SA',
      country_name: 'Saudi Arabia',
      dialling_code: '966',
    });
    // this.ngZone.run(() => {
    //   this.mobile = '+' + this.ccCode;
    //   console.log(this.mobile);
    // });
  }

  ngOnInit() {}

  async openModal(userId) {
    const modal = await this.modalCtrl.create({
      component: VerifyPage,
      componentProps: { code: this.ccCode, mobile: this.mobile, uid: userId },
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

    // set correct mobile code
    this.mobile = this.mobile.toString();
    // this.mobile = '+966' + this.mobile;
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
      mobile: this.mobile,
      status: this.util.twillo === '1' ? 0 : 1,
      verified: 0,
      others: 1,
      date: moment().format('YYYY-MM-DD'),
      stripe_key: '',
    };

    console.log('param', param);
    console.log('mobile', this.mobile);
    this.loggedIn = true;
    this.api.post('users/registerUser', param).subscribe(
      (data: any) => {
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
                fcm_token: fcm,
              };
              this.api.post('users/edit_profile', updateParam).subscribe(
                (data: any) => {
                  console.log('user info=>', data);
                },
                (error) => {
                  console.log(error);
                }
              );
            }
            this.sendVerification(this.email, this.api.baseUrl + 'users/verify?uid=' + data.data.id);
            this.navCtrl.navigateRoot(['']);
          }
        } else if (data && data.status === 500) {
          this.util.errorToast(data.data.message);
        } else {
          this.util.errorToast(this.util.getString('Something went wrong'));
        }
      },
      (error) => {
        console.log(error);
        this.loggedIn = false;
        this.util.errorToast(this.util.getString('Something went wrong'));
      }
    );
  }

  mobileChange() {
    // this.mobile = this.mobile.toString();
    // this.mobile = '+966' + this.mobile;
    // console.log(this.mobile);
  }

  public focusInput(event): void {
    // let total = 0;
    // let container = null;
    // const _rec = (obj) => {
    //   total += obj.offsetTop;
    //   const par = obj.offsetParent;
    //   if (par && par.localName !== 'ion-content') {
    //     _rec(par);
    //   } else {
    //     container = par;
    //   }
    // };
    // _rec(event.target);
    // container.scrollToPoint(0, total - 50, 400);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    var element = document.getElementById('email');

    element.scrollIntoView();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  whatsAppMessage() {
    location.href = 'https://wa.me/966583001241?text=Hello';
  }

  sendVerification(mail, link) {
    const param = {
      email: mail,
      url: link,
    };

    this.api.post('users/sendVerificationMail', param).subscribe(
      (data) => {
        console.log('mail', data);
      },
      (error) => {
        console.log(error);
      }
    );
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
    if (type === 'terms') {
      window.open('http://app.7days.one/terms.html', '_blank');
      // this.iab.create('http://app.7days.one/terms.html');
    } else {
      window.open('http://app.7days.one/privacy.html', '_blank');
      // this.iab.create('http://app.7days.one/privacy.html');
    }
  }
}
