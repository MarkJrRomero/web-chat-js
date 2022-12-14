import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
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


async function getMyContacts(){
  let listaDeContactos = "";
  const users = await getDocs(collection(db, `users`));
  users.forEach((doc) => {
    // console.log(doc.data().first);
    listaDeContactos = listaDeContactos + 
    `<div class="users-chat">
      <img onclick="saveUserRef('${doc.data().uid}')" class="user-profile" src="${doc.data().image}" alt="user_profile">
      <span class="last-message">${doc.data().name}</span>
      <button onclick="saveUserRef('${doc.data().uid}')" type="button" class="btn btn-primary verSmsUid"> <i class="fa-solid fa-comment"></i></button>
    </div>`
  });
  // console.log(listaUsers);
  $('#myContacts').html(listaDeContactos);
}


async function getMessagesUser(){
  const uid = localStorage.getItem("uidUsuarioContact");
  const dataUser = JSON.parse(localStorage.getItem("dataUser"));
  const myUserId = dataUser.uid;

  console.log(`${myUserId}SMS${uid}`);

  let listaDeSms = ""; 
  let users;
  users = await getDocs(query(collection(db, `${myUserId}SMS${uid}`), orderBy('time',"desc")));
  console.log(users.docs.length);
  if (users.docs.length == 0){
    users = await getDocs(query(collection(db, `${uid}SMS${myUserId}`), orderBy('time',"desc")));
  }
    users.forEach((doc) => {
    
      let image = doc.data().image == '' || doc.data().image == undefined ? "./assets/default.jpg" :  doc.data().image;
  
      if (doc.data().uid == myUserId){
        listaDeSms = listaDeSms + 
        `<div class="message-me">
              <div class="profile-me-div">
                  <img class="profile-me" src="${image}" alt="${doc.data().name}">
                  <span class="name-me">You</span>
              </div>
              <p class="text-me">${doc.data().message}</p>
          </div>`
      }else{
        listaDeSms = listaDeSms + 
        `<div class="message-friend">
              <div class="profile-message-div">
                  <img class="profile-message" src="${image}" alt="${doc.data().name}">
                  <span class="name-message">${doc.data().name}</span>
              </div>
              <p class="text-message">${doc.data().message}</p>
          </div>`
      }
      
    }); 
  
  
  console.log(listaDeSms);
  $('#chat-box-messages').html(listaDeSms);
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
  
  let body = `<img class='user-add-image' src='${userImage}' alt='${userName}'>`;

  $('#modalAddUserLabel').html("Agregar usuario: "+userName);
  $('#modalAddUserBody').html(body);

  if(userName != ''){
    $('#modalAddUser').modal("show");
  }
  
});

// Agregar el usuario
$( "#addUserAction" ).click(async function() {
  const myUserId = "myUserIdDePrueba";
  let userName = $('select[name="find-user-input"] option:selected').text();
  let userImage = $('select[name="find-user-input"] option:selected').attr('image');
  let userId = $('select[name="find-user-input"] option:selected').val();

  try {
    const docRef = await addDoc(collection(db, `${myUserId}CONTACTS`), {
      name: userName,
      uid: userId,
      image: userImage
    });
    $('#modalAddUser').modal("hide");
    getMyContacts();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
});


// ENVIAR MENSAJE
$( ".btnSend" ).click(async function() {
  let message = $('#message').val();
  const uid = localStorage.getItem("uidUsuarioContact");

    if(message != '' && uid != null){
      
      const dataUser = JSON.parse(localStorage.getItem("dataUser"));
      const myUserId = dataUser.uid;
      const name = dataUser.displayName;
      const image = dataUser.photoURL;

      try {
        const docRef = await addDoc(collection(db, `${myUserId}SMS${uid}`), {
          name: name,
          image: image,
          uid: myUserId,
          message: message,
          time: Date.now()
        });
        
        $('#message').val('')
        getMessagesUser();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  }
  
});


$(document).on('keypress',async function(e) {
  if(e.which == 13) {
    let message = $('#message').val();
    const uid = localStorage.getItem("uidUsuarioContact");

    if(message != '' && uid != null){

      const dataUser = JSON.parse(localStorage.getItem("dataUser"));
      const myUserId = dataUser.uid;
      const name = dataUser.displayName;
      const image = dataUser.photoURL;
      
      try {
        const docRef = await addDoc(collection(db, `${myUserId}SMS${uid}`), {
          name: name,
          image: image,
          uid: myUserId,
          message: message,
          time: Date.now()
        });
        
        $('#message').val('')
        getMessagesUser();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  }
});





await getMyContacts();



$( ".verSmsUid" ).click(async function() {
  console.log('here');
  setTimeout(()=> { getMessagesUser(); },500);
});

$( ".user-profile" ).click(async function() {
  console.log('here');
  setTimeout(()=> { getMessagesUser(); },500);
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

  try {
    const docRef = await addDoc(collection(db, `users`), {
      name: dataUser.displayName,
      image: dataUser.photoURL,
      uid: dataUser.uid,
    });
    
      window.location.href = "./home.html";
  } catch (e) {
    console.error("Error adding document: ", e);
  }


}

$( "#loginGoogle" ).click(async function() {
  loginGoogle();
});



