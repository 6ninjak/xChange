// $(document).ready(function(){
  
//   var nome = leggiCookie('cookieProva');
//   console.log(nome);
//   $('#nomeUtente').text(nome.nome);
// });

// function leggiCookie(nomeCookie)
// {
//   if (document.cookie.length > 0)
//   {
//     var inizio = document.cookie.indexOf(nomeCookie + "=");
//     if (inizio != -1)
//     {
//       inizio = inizio + nomeCookie.length + 1;
//       var fine = document.cookie.indexOf(";",inizio);
//       if (fine == -1) fine = document.cookie.length;
//       return unescape(document.cookie.substring(inizio,fine));
//     }else{
//        return "";
//     }
//   }
//   return "";
// }