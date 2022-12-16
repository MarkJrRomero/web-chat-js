import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc, 
  collection, addDoc, getDocs, query, 
  orderBy, deleteDoc, onSnapshot, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyD8gQ89A0lyr-TGc58qVYj2T3E-Se6jx5Q",
  authDomain: "web-chat-b0e40.firebaseapp.com",
  projectId: "web-chat-b0e40",
  storageBucket: "web-chat-b0e40.appspot.com",
  messagingSenderId: "995110408125",
  appId: "1:995110408125:web:9d730d8300b84b498a8cd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let URLactual = window.location.pathname;

// VALIDAR SI SE ESTA LOGEADO
async function validarLogin(){
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));
  // console.log(dataUser);
  if(dataUser == null){
    window.location.href = "./index.html";
  }
}

async function validarLogin2(){
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));
  // console.log(dataUser);
  if(dataUser != null){
    window.location.href = "./home.html";
  }
}

if(URLactual == '/home.html'){
await validarLogin();
}else{
  await validarLogin2();
}


async function getMyContacts(){
 

  onSnapshot(collection(db, `users`), (querySnapshot) => {
    let listaDeContactos = "";
    querySnapshot.forEach((doc) => {
      // console.log('change users')
      const dataUser = JSON.parse(localStorage.getItem("dataUser"));

      let color = doc.data().online == true ? '#186b1f49' : '#6b181849';
      if(dataUser.email != doc.data().uid){
        listaDeContactos = listaDeContactos + 
        `<div class="users-chat" style="background-color: ${color};">
          <img onclick="saveUserRef('${doc.data().uid}')" class="user-profile" src="${doc.data().image}">
          <span class="last-message">${doc.data().name}</span>
          <button onclick="saveUserRef('${doc.data().uid}')" type="button" class="btn btn-primary verSmsUid"> <i class="fa-solid fa-comment"></i></button>
        </div>`
      }
    });
    // console.log(listaUsers);
    $('#myContacts').html(listaDeContactos);

  })
}

function notificacion(data){

  const dataUser = JSON.parse(localStorage.getItem("dataUser"));
  console.log(data);
  console.log(dataUser.email);
  if(data.uid != dataUser.email){
    if (Notification.permission === "granted") {
      var body = data.message;
      var icon = data.image;
      var title = data.name;
      var options = {
          body: body,      //El texto o resumen de lo que deseamos notificar.
          icon: icon,      //El URL de una imágen para usarla como icono.
          lang: "ES",      //El idioma utilizado en la notificación.
          tag: 'notify',   //Un ID para el elemento para hacer get/set de ser necesario.
          dir: 'auto',     // izquierda o derecha (auto).
          renotify: "true" //Se puede volver a usar la notificación, default: false.
      }
      // Creamos la notificación con las opciones que pusimos arriba.
      var notification = new Notification(title,options);
      // Cerramos la notificación.
      setTimeout(notification.close.bind(notification), 5000);
    }
  }
  
}

function getMessagesUser(){
  
  const uid = localStorage.getItem("uidUsuarioContact");
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));
  const myUserId = dataUser.email;
  
  // console.log(`${myUserId}SMS${uid}`);
  onSnapshot(query(collection(db, `${myUserId}SMS${uid}`), orderBy("time","desc")), (querySnapshot) => {
    // console.log('change')

    notificacion(querySnapshot.docs[0].data());

    let listaDeSms = ""; 
    querySnapshot.forEach((doc) => {
      // console.log(doc);
      let image = doc.data().image == '' || doc.data().image == undefined ? "./assets/default.jpg" :  doc.data().image;
      
      if (doc.data().uid == myUserId){
        listaDeSms = listaDeSms + 
        `<div class="message-me">
              <div class="profile-me-div">
                  <img class="profile-me" src="${image}" >
                  <span class="name-me">You</span>
              </div>
              <p class="text-me">${doc.data().message}</p>
          </div>`
      }else{
        localStorage.setItem("uidUsuarioContact", doc.data().uid);
        listaDeSms = listaDeSms + 
        `<div class="message-friend">
              <div class="profile-message-div">
                  <img class="profile-message" src="${image}">
                  <span class="name-message">${doc.data().name}</span>
              </div>
              <p class="text-me">${doc.data().message}</p>
          </div>`

          let userProfileHtml = 
            ` <img class="profile-image" src="${image}">
              <span class="profile-name">${doc.data().name}</span>
              <span class="profile-name">(In the chat)</span>
            `;
          
            $('#other-profile').html(userProfileHtml);
            
      }

      // console.log(listaDeSms);
    
    }); 
    $('#chat-box-messages').html(listaDeSms);
  })
  
  
}

// ACTIONS =================================

// Busca los usuarios logeados
$( "#findUser" ).click(async function() {
  let listaUsers = "";
  const users = await getDocs(collection(db, "users"));
  users.forEach((doc) => {
    // console.log(doc.data().first);
    listaUsers = listaUsers + `<option value="${doc.data().uid}" image="${doc.data().image}">${doc.data().name}</option>`
  });
  // console.log(listaUsers);
  $('#find-user-input').html(listaUsers);
});

// Abre el modal apra agregar usuario
$( "#addUser" ).click(async function() {
  let userName = $('select[name="find-user-input"] option:selected').text();
  let userImage = $('select[name="find-user-input"] option:selected').attr('image');
  
  let body = `<img class='user-add-image' src='${userImage}'>`;

  $('#modalAddUserLabel').html("Agregar usuario: "+userName);
  $('#modalAddUserBody').html(body);

  if(userName != ''){
    $('#modalAddUser').modal("show");
  }
  
});

// Agregar el usuario
// $( "#addUserAction" ).click(async function() {
//   const myUserId = "myUserIdDePrueba";
//   let userName = $('select[name="find-user-input"] option:selected').text();
//   let userImage = $('select[name="find-user-input"] option:selected').attr('image');
//   let userId = $('select[name="find-user-input"] option:selected').val();

//   try {
//     const docRef = await addDoc(collection(db, `${myUserId}CONTACTS`), {
//       name: userName,
//       uid: userId,
//       image: userImage
//     });
//     $('#modalAddUser').modal("hide");
//     getMyContacts();
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// });


async function sendSms(){

    let message = $('#message').val();
    const uid = localStorage.getItem("uidUsuarioContact");


    if(message != '' && uid != null){
      
      const dataUser = JSON.parse(localStorage.getItem("dataUser"));
      const myUserId = dataUser.email;
      const name = dataUser.displayName;
      const image = dataUser.photoURL;

      let collect1 = `${myUserId}SMS${uid}`;
      let collect2 = `${uid}SMS${myUserId}`;
     
      let now = Date.now();
      
      try {

        $('#message').val('')

        await addDoc(collection(db, collect1), {
          name: name,
          image: image,
          uid: myUserId,
          message: message,
          time: serverTimestamp(),
          notifi: false
        });

        await addDoc(collection(db, collect2), {
          name: name,
          image: image,
          uid: myUserId,
          message: message,
          time: serverTimestamp(),
          notifi: false
        });
        

      } catch (e) {
        console.error("Error adding document: ", e);
      }
  }
}

// ENVIAR MENSAJE
$( ".btnSend" ).click(async function() {
  sendSms();
});


$(document).on('keypress',async function(e) {
  if(e.keyCode == 13)
  {
    sendSms();
  }
});


// Login google
async function loginGoogle(){
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  signInWithPopup(auth, provider)
  .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      localStorage.setItem("dataUser", JSON.stringify(user));
      saveDataUser();
  }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
  })
}

async function saveDataUser(){
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));

  let users = await getDocs(query(collection(db, 'users')));
  let existe = false;
  let adentro = false;
  let docRef;
  users.forEach((docs) => {
    if(docs.data().uid == dataUser.email){
      existe = true;
      docRef = doc(db, "users", docs.id);
      if(docs.data().online == true){
        adentro = true;
      }
    }
  });
  
  if(existe == true){

    if(adentro == false){
      
      const data = {
        online: true
      };
  
      updateDoc(docRef, data)
      .then(docRef => {
        window.location.href = "./home.html";
      })
      .catch(error => {
          console.log(error);
      })
    }else{
      localStorage.clear();
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ya tienes una sesión activa!',
      })
    }
    

  }else{
    try {
      const docRef = await addDoc(collection(db, `users`), {
        name: dataUser.displayName,
        image: dataUser.photoURL,
        uid: dataUser.email,
        online: true,
      });
      
        window.location.href = "./home.html";
    } catch (e) {
      console.error("Error al guardar usuario: ", e);
    }
    
  }

}

$( "#loginGoogle" ).click(async function() {
  loginGoogle();
});


function buscarMensajes() {
  // setInterval(getMessagesUser, 500);
  getMyContacts();
}




async function getUserProfile(){
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));

  let userProfileHtml = 
  ` <img class="profile-image" src="${dataUser.photoURL}">
    <span class="profile-name">${dataUser.displayName}</span>
    <button type="button" uid="${dataUser.email}" class="btn btn-danger logout"><i class="fa-solid fa-right-from-bracket"></i></button>
    
  `;

  let navProfileHtml = 
  `<img class="nav-profile" src="${dataUser.photoURL}">
  <button type="button" uid="${dataUser.email}" class="btn btn-danger logout NavBtn"><i class="fa-solid fa-right-from-bracket"></i></button>`

  $('#nav-profile-div').html(navProfileHtml);
  $('#me-profile').html(userProfileHtml);
  

}


const dataUser = JSON.parse(localStorage.getItem("dataUser"));
if(dataUser != null){
  buscarMensajes();
  getUserProfile();
}

// LogoutGoogle
$( ".logout" ).click(async function() {

  let uid = $('.logout').attr('uid');
  let users =  await getDocs(query(collection(db, 'users')));

  Swal.fire({
    title: 'Seguro que quieres cerrar la sesion?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then(async (result) => {
    if (result.isConfirmed) {

          users.forEach(async (docs) => {
            if(docs.data().uid == uid){

              const docRef = doc(db, "users", docs.id);

              const data = {
                online: false
              };

              updateDoc(docRef, data)
              .then(docRef => {
                  localStorage.clear();
                  validarLogin();
              })
              .catch(error => {
                  console.log(error);
              })

            }
          });

    }
  })

});


$( ".btnEmpanada" ).click(async function() {
  // console.log('here');
  getMessagesUser();
});



// RESPONSIVE
let ventana_ancho = $(window).width();
  // console.log(ventana_ancho);
  if(ventana_ancho < 601){
    $("#row-chat-box").removeClass("row");
  }else{
    $("#row-chat-box").addClass("row");
  } 

$(window).resize(function() {
  let ventana_ancho = $(window).width();
  // console.log(ventana_ancho);
  if(ventana_ancho < 601){
    $("#row-chat-box").removeClass("row");
  }else{
    $("#row-chat-box").addClass("row");
  } 
  
});




// PERMISO NOTIFICACIONES
if (Notification.permission !== 'denied') {
  Notification.requestPermission(function (permission) {
      // Acción si el usuario acepta.
  });
}
