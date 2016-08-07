var {Menu, MenuItem, Tray} = require('electron').remote
var path = require('path');
var ipc = require('electron').ipcRenderer;
const clipboard = require('electron').clipboard
const storage = require('electron-json-storage');
const otp = require('otplib/lib/authenticator');

var accounts = [];

var trayIcon = new Tray(path.join(__dirname,'/img/icon.png'));
const trayMenu = new Menu();

storage.get('accounts', function(error, savedAccounts){
    savedAccounts.forEach(function(account){
        createNewAccount(account);
    });

    trayMenu.append(new MenuItem({type: 'separator'}));
    trayMenu.append(new MenuItem({
        role: "unhide",
        label: "New account..."
    }));
    trayMenu.append(new MenuItem({
        role: "quit",
        label: "Quit"
    }));

    trayIcon.setContextMenu(trayMenu);
});

ipc.on('new-account', function (event, account) {
    createNewAccount(account);

    storage.set('accounts', accounts, function(error) {
      if (error) throw error;
    });
});

ipc.on('delete-account', function (event, account) {
    accounts = accounts.filter(function(acc){
      return acc.name !== account;
    });
    console.log(accounts);

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
  var account = e.target.parentNode.parentNode.parentNode;
	if ((e.target.tagName == 'IMG') && (e.target.className == 'copy')){
    console.log(account);
		clipboard.writeText(account.dataset.token);
	} else if ((e.target.tagName == 'IMG') && (e.target.className == 'edit')){
		clipboard.writeText(e.target.dataset.token);
	} else if ((e.target.tagName == 'IMG') && (e.target.className == 'trash')){
    this.removeChild(account);
    ipc.send('delete-account', account.dataset.name);
	}else{
    console.log(e.target);
  }
});

document.getElementById('lol_accounts').addEventListener("click", function(e){
	if (e.target.tagName == 'SPAN') {
		clipboard.writeText(e.target.dataset.token);
	}
});

function createNewAccount(account) {
    var wrapper = document.createElement("div");
    wrapper.className = "token-input";

    var accountDiv = document.createElement("div");
    accountDiv.className = "account-name";

    var accountName = document.createElement("div");
    accountName.className = "account-name2";
    accountName.textContent = account.name;

    var accountToken = document.createElement("div");
    accountToken.className = "account-token";

    wrapper.appendChild(accountDiv);
    accountDiv.appendChild(accountName);
    accountDiv.appendChild(accountToken);

    var copyDiv = document.createElement("div");
    var copyLink = document.createElement("a");
    var copyIcon = document.createElement("img");
    copyIcon.src = "img/copy.png";
    copyIcon.className = "copy";
    copyLink.appendChild(copyIcon);
    copyLink.href = "#";
    copyDiv.appendChild(copyLink);
    wrapper.appendChild(copyDiv);

    var editDiv = document.createElement("div");
    var editLink = document.createElement("a");
    var editIcon = document.createElement("img");
    editIcon.src = "img/edit.png";
    editIcon.className = "edit";
    editLink.appendChild(editIcon);
    editLink.href = "#";
    editDiv.appendChild(editLink);
    wrapper.appendChild(editDiv);

    var trashDiv = document.createElement("div");
    var trashLink = document.createElement("a");
    var trashIcon = document.createElement("img");
    trashIcon.src = "img/trash.png";
    trashIcon.className = "trash";
    trashLink.appendChild(trashIcon);
    trashLink.href = "#";
    trashDiv.appendChild(trashLink);
    wrapper.appendChild(trashDiv);

    document.getElementById('lol_accounts').appendChild(wrapper);

    wrapper.id = account.name + "-token-input";
    wrapper.dataset.name = account.name;
    wrapper.dataset.secret = account.secret;

    window.setInterval(function(){
      var code = otp.generate(wrapper.dataset.secret);
      accountToken.textContent = code;
      wrapper.dataset.token = code;
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

    accounts.push(account);
}
