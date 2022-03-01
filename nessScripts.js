function menuDropdown() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

// function passwordCheck(){
//   if(document.getElementById('password').value == 'onlyyouknowit'){
//       return true;
//   }else{
//     alert('Wrong Password');
//     return false;
//   }
// }