
/**
 * Driver interface
 * @interface
 * @extends Document
 */
function Beekeeper() {
   /**
    * Driver number
    * @type {string}
    */
   this.no = "";

   /**
    * Date
    * @type {Date}
    */
   this.date = new Date();

   /**
    * First name of the driver
    * @type {string}
    */
   this.firstName = "";

   /**
    * Last name of the driver
    * @type {string}
    */
   this.lastName = "";

   /**
    * National ID card number of the driver
    * @type {string}
    */
   this.nic = "";

   /**
    * Gender of the driver
    * @type {string}
    */
   this.gender = "";

   /**
    * Date of birth of the driver
    * @type {Date}
    */
   this.dob = new Date();

   /**
    * Contact number of the driver
    * @type {string}
    */
   this.contactNo = "";

   /**
    * Email of the driver
    * @type {string}
    */
   this.email = "";

   /**
    * License number of the driver
    * @type {string}
    */
   this.licenseNo = "";

   /**
    * License expiration date of the driver
    * @type {Date}
    */
   this.licenseExpireDate = new Date();

   /**
    * Medical issues of the driver
    * @type {string}
    */
   this.medicalIssues = "";

   /**
    * driver status
    * @type {boolean}
    */
   this.isActive = false;

}

module.exports = { Beekeeper: Beekeeper};