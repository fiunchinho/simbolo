var {Menu, MenuItem, Tray} = require('electron').remote
var path = require('path');
var ipc = require('electron').ipcRenderer;
const clipboard = require('electron').clipboard
const storage = require('electron-json-storage');
const otp = require('otplib/lib/authenticator');

var accounts = [];

var trayIcon = new Tray(path.join(__dirname,'/icon.png'));
const trayMenu = new Menu();

storage.get('accounts', function(error, savedAccounts){
    savedAccounts.forEach(function(account){
        createNewAccount(account);
    })
});

ipc.on('new-account', function (event, account) {
    createNewAccount(account);

    storage.set('accounts', accounts, function(error) {
      if (error) throw error;
    });
});

ipc.on('remove-tray', function () {
  trayIcon.destroy()
})

document.getElementById('save-form').addEventListener("submit", (e) => {
  e.preventDefault();
  var account = {
    name: e.target.elements.namedItem("account-name").value,
    secret: e.target.elements.namedItem("account-secret").value
  };
  ipc.send('new-account', account);
});

document.getElementById('lol_accounts').addEventListener("click", function(e){
	if (e.target.tagName == 'SPAN') {
		clipboard.writeText(e.target.dataset.token);
	}
});

function createNewAccount(account) {
    var input = document.createElement("span");
    input.id = account.name + "-token-input";
    input.type = "text";
    input.className = "token-input";
    input.dataset.name = account.name;
    input.dataset.secret = account.secret;
    document.getElementById('lol_accounts').appendChild(input);

    window.setInterval(function(){
      var code = otp.generate(input.dataset.secret);
      input.textContent = account.name + ": " + code;
      input.dataset.token = code;
    }, 1000);

    var newAccount = new MenuItem({
        label: account.name,
        type: 'radio',
        id: account.name,
        click:function(){
            clipboard.writeText(document.getElementById(account.name + '-token-input').dataset.token);
            ipc.send('copy-porta', account.name);
        }
    });

    trayMenu.append(newAccount);
    trayIcon.setContextMenu(trayMenu);

    accounts.push(account);
}