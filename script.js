const API = "https://script.google.com/macros/s/AKfycbxRa_PLC_aO0EeWQBrNV7NXVoh6yb4ZlZrHz1o8oyhcu2QjXAac53Bjh3BKp8PIublL/exec";


async function login() {
let username = document.getElementById("username").value;
let password = document.getElementById("password").value;


let res = await fetch(API, {
method: "POST",
body: JSON.stringify({
action: "login",
username,
password
})
});


let data = await res.json();


if (!data.success) {
document.getElementById("msg").innerText = "خطأ في تسجيل الدخول";
return;
}


localStorage.setItem("client_id", data.client_id);
localStorage.setItem("client_name", data.name);


window.location = "client.html";
}


// صفحة العميل
if (location.pathname.includes("client.html")) loadClient();


async function loadClient() {
document.getElementById("clientName").innerText = localStorage.getItem("client_name");


let res = await fetch(API, {
method: "POST",
}
