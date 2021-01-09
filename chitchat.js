const { Console } = require('console'),
    inquirer = require('inquirer'),
    fs = require('fs'),
    userjson = JSON.parse(fs.readFileSync("user.json")),
    messagejson = JSON.parse(fs.readFileSync("message.json"));
let username, password, arr;
Main();

function Main() {
    console.log("What do you want to do?");
    inquirer
        .prompt([{
            type: 'list',
            name: 'lr',
            message: 'Options:',
            choices: ['Login', 'Register', 'Exit']
        }]).then(answers => {
            if (answers.lr == 'Login')
                Login();
            else if (answers.lr == 'Register')
                Register();
            else return;
        });
}


async function Login() {
    await inquirer
        .prompt([{
            type: 'input',
            name: 'u',
            message: 'Enter your username:'
        }])
        .then(answers => {
            username = answers.u;
        });
    await inquirer
        .prompt([{
            type: 'password',
            mask: '*',
            name: 'p',
            message: 'Enter your password:'
        }]).then(answers => {
            password = answers.p;
        });
    if (UserCheck() && PassCheck()) {
        console.log("Welcome back " + username);
        Menu();
    } else {
        if (!UserCheck() && !PassCheck())
            console.log("Both credentials are wrong");
        else if (!UserCheck())
            console.log("The username is wrong");
        else
            console.log("The password is wrong");
        Main();
    }
}

async function Register() {
    await inquirer
        .prompt([{
            type: 'input',
            name: 'u',
            message: 'Enter a username:'
        }])
        .then(answers => {
            username = answers.u;
        });
    await inquirer
        .prompt([{
            type: 'password',
            mask: '*',
            name: 'p',
            message: 'Enter a password:'
        }]).then(answers => {
            password = answers.p;
        });
    if (!UserCheck())
        CreateAccount();
    else {
        console.log("This username has already been taken");
        Main();
    }
}

function CreateAccount() {
    userjson.push(JSON.parse('{ "id":"' + Object.keys(userjson).length + '", "username":"' + username + '", "password":"' + password + '"}'));
    let cont = JSON.stringify(userjson);
    fs.writeFileSync("user.json", cont);
    console.log("Welcome " + username);
    Menu();
}



function ThisUser() { return userjson.find(u => u.username == username).id }

function UserSearch(usern) { return userjson.find(u => u.username == usern).id }


function UserCheck() {
    return userjson.find(u => u.username == username);
}

function PassCheck() {
    return userjson.find(u => u.password == password);
}

function Menu() {
    inquirer
        .prompt([{
            type: 'list',
            name: 'op',
            message: 'Options:',
            choices: ['Write a new message', 'Read chats', 'Delete messages', 'Logout']
        }]).then(answers => {
            if (answers.op == 'Write a new message') {
                NewMessage();
            } else if (answers.op == 'Read chats') {
                ReadChats();
            } else if (answers.op == 'Delete messages') {
                DeleteMessages();
            } else Main();
        });
}

async function NewMessage() {
    let fk_id_d, message;
    await inquirer
        .prompt([{
            type: 'list',
            name: 'd',
            message: 'Select a receiver:',
            choices: DynamicUsers()
        }])
        .then(answers => {
            fk_id_d = answers.d;
        });
    if (fk_id_d != "Cancel operation") {
        fk_id_d = UserSearch(fk_id_d);
        await inquirer
            .prompt([{
                type: 'input',
                name: 'm',
                message: 'Type the message:'
            }])
            .then(answers => {
                message = answers.m;
                if (message != "") {
                    messagejson.push(JSON.parse('{ "id":"' + Object.keys(messagejson).length + '", "fk_id_m":"' + ThisUser() + '", "fk_id_d":"' + fk_id_d + '", "message":"' + message + '"}'));
                    let cont = JSON.stringify(messagejson);
                    fs.writeFileSync("message.json", cont);
                }
            });
    }
    Menu();

}

async function ReadChats() {
    await inquirer
        .prompt([{
            type: 'list',
            name: 'd',
            message: 'Select a chat:',
            choices: DynamicUsers()
        }])
        .then(answers => {
            if (answers.d == "Cancel operation")
                Menu();
            else {
                PrintChat(answers.d);
            }
        });
}

function PrintChat(usern) {
    let userid = UserSearch(usern);
    console.log("Conversasion with " + usern);
    for (let i = 0; i < Object.keys(messagejson).length; i++) {
        if (messagejson[i].fk_id_d == userid && messagejson[i].fk_id_m == ThisUser())
            console.log("You said:\n" + messagejson[i].message);
        else if (messagejson[i].fk_id_m == userid && messagejson[i].fk_id_d == ThisUser())
            console.log(usern + " said:\n" + messagejson[i].message);
    }
    console.log("End of the conversation");
    Menu();
}

function DynamicUsers() {
    arr = [];
    arr = userjson.map(names => names.username);
    arr.splice(arr.indexOf(username), 1);
    arr.unshift('Cancel operation');
    return arr;
}


function DynamicChatD(usern) {
    let userid = UserSearch(usern);
    arr = [];
    arr = messagejson.map(mes =>
        (mes.fk_id_d == userid && mes.fk_id_m == ThisUser() || mes.fk_id_m == userid && mes.fk_id_d == ThisUser()) ? mes.message :
        null);
    arr.unshift('Cancel operation');;
    return arr;
}
async function DeleteMessages() {
    let fk_id_d,
        melete;
    await inquirer
        .prompt([{
            type: 'list',
            name: 'd',
            message: 'Select a chat:',
            choices: DynamicUsers()
        }])
        .then(answers =>
            fk_id_d = answers.d);
    if (fk_id_d != "Cancel operation") {
        await inquirer
            .prompt([{
                type: 'list',
                name: 'm',
                message: 'Select the message you want to delete:',
                choices: DynamicChatD(fk_id_d)
            }])
            .then(answers => {
                if (answers.m != "Cancel operation") {
                    melete = DynamicChatD(fk_id_d).find(mes => mes.message == answers.m);
                    messagejson.splice(melete, 1);
                    let cont = JSON.stringify(messagejson);
                    fs.writeFileSync("message.json", cont);
                }
            });
    }
    Menu();
}