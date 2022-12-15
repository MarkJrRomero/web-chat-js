async function saveUserRef(uid){
    // console.log('ok');
    localStorage.removeItem("uidUsuarioContact");
    localStorage.setItem("uidUsuarioContact", uid);
    $(".btnEmpanada").trigger("click");
}


