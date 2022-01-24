var fs = require('fs');

String.prototype.fixFPErrors =
    Number.prototype.fixFPErrors =
    () => {
        return parseFloat(this.toFixed(4));
    }

Math.lerp = function (start, end, amount) { return start + amount * (end - start) }

Math.clamp = function (num, min, max) { return Math.min(Math.max(num, min), max); }

//  modified to allow larger influencesversion of : https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range
Math.biasedRand = function (min, max, bias, influence) {
    var rnd = Math.random() * (max - min) + min,                // random in range
        mix = Math.clamp(Math.random() * influence, 0, 1);      // random mixer
    return rnd * (1 - mix) + bias * mix;                        // mix full range and bias
}

String.prototype.equalsIgnoreCase = function (otherString) {
    return this.localeCompare(otherString, undefined, { sensitivity: 'accent' }) == 1; // == 1 because it returns a number, 1 will be true
}

String.prototype.toCaps = function () {
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return this.split(' ').map(capitalize).join(' ');
}

Date.nowWA = function () {
    return new Date((new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 480 * 60000));
}

Date.parseWADate = function (date) {
    let pieces = date.split("/");
    let toParse = date;

    if (pieces[0].length <= 2) toParse = pieces[1] + "/" + pieces[0] + "/" + pieces[2]; // converts from the right way to the american way

    return new Date(Date.parse(toParse)).addHours(8);
}

Date.prototype.toCountdown = function () {
    const days = Math.floor(this.getTime() / (1000 * 60 * 60 * 24));
    const timeHMS = new Date(this.getTime()).toISOString().substr(11, 8);
    const hours = parseInt(timeHMS.substr(0, 2));
    const mins = parseInt(timeHMS.substr(3, 5));
    const secs = parseInt(timeHMS.substr(6, 8));

    let string = "";
    if (days != 0) string += `${days}d `
    if (hours != 0) string += `${hours}h `
    if (mins != 0) string += `${mins}m `
    if (secs != 0) string += `${secs}s `
    if (string == "") string = "0s"; // if the timer is 0;
    if (string.charAt(string.length - 1)) string = string.slice(0, -1) // remove space from end

    /*(days > 0 ? days + "d " : "") + 
            (hours > 0 || days > 0 ? hours + "h " : "") +
            (mins > 0 || hours > 0 || days > 0 ? mins + "m " : "") +
            secs + "s ";*/

    return string;
}

Date.prototype.toDMYHM = function () {
    return this.getDate() + "/" + this.getMonth() + "/" + this.getFullYear() + " " + this.getHours() + ":" + ('0' + this.getMinutes()).slice(-2);;
}

Date.prototype.toHM = function () {
    return this.getHours() + ":" + ('0' + this.getMinutes()).slice(-2);;
}

Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
}
// 23 - 1
Date.prototype.betweenHours = function (min, max) {
    if (min > max) return this.getHours() >= min || this.getHours() < max;
    return this.getHours() >= min && this.getHours() < max;
}

// sorts by value not key
Map.prototype.sortMap = function () {
    // spread syntax (...) expands map into its values
    // sort returns an array with the key and value as index 0 and 1 respectively
    return new Map([...this.entries()].sort((a, b) => b[1] - a[1]));
}
Map.prototype.sortMapObject = function (byField) {
    return new Map([...this.entries()].sort((a, b) => b[1][byField] - a[1][byField]));
}
