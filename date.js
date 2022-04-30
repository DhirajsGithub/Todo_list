// modules are objects 
// jshint esversion:6 


let formatedDate = function (){
    // formating the date with usual format from https://stackoverflow.com/questions/3552461/how-do-i-format-a-date-in-javascript
    let today = new Date();
    let options = {
        weekday: "long", 
        day: "numeric",
        month: "long"
    }

    let fullDay = today.toLocaleDateString("en-US", options)
    return fullDay;
}
// exporting formatedDate value form object date
// module.exports.formatedDate = formatedDate;
// same as 
exports.formatedDate = formatedDate;



let formatedYear = function(){
    let today = new Date();
    let year = today.getFullYear();
    return year;
}
module.exports.formatedYear = formatedYear;