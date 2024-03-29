var mysql = require('mysql');
var url = require('url');
// const cors = require('cors');
var express = require('express');
var cookieParser=require('cookie-parser');
const bodyparser = require('body-parser');
const jwt  =require('jsonwebtoken');
const { error } = require('console');
const { CLIENT_RENEG_LIMIT } = require('tls');
var app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
// app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json());


try {
    app.use(cookieParser());
    
} catch (error) {
    console.log(error);
}

var con = mysql.createConnection({ host: "localhost", user: "root", password: "root", database: 'job_app', multipleStatements: true });
con.connect(function (err) {
    if (err) throw err;
    console.log('connect');
});
function execute(q, data) {
    return new Promise((resolve, reject) => {
        con.query(q, [data], function (err, result) {
            if (err) return reject(err);
            // console.log(result);
            resolve(result);
        });
    })
}


function salt() {
    let text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var salt = "";
    for (let i = 0; i < 4; i++) {
        salt += text.charAt(Math.floor(Math.random() * 26));

    }
    console.log(salt);
    return salt;
}
function activationcode() {
    let text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var code = "";
    for (let i = 0; i < 12; i++) {
        code += text.charAt(Math.floor(Math.random() * 36));

    }
    console.log(code);
    return code;
}




app.all('/setpassword', async (req, res) => {
    var data = req.body;
    var s = salt();
    var code = req.body.accode;
    console.log(data);
    d = [];
    console.log("pass from form", data.password1);
    var password = `${data.password1}${s}`;
    console.log("pass at insert", password);
    // var sp=url.parse(req.url,true).query;
    // console.log("code",sp.code);
    // console.log("jkhh",username);
    var q1 = `select username from users where activationcode='${code}'`;
    // console.log(q1);
    result2 = await execute(q1, d);
    if (!(code.trim() == "") && result2.length > 0) {
        // console.log(result2);
        var q = `update users set password= md5('${password}'),salt='${s}',status='1' where username='${result2[0].username}' AND activationcode='${code}'`;
        // console.log(q);
        result2 = await execute(q, d);
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "password set" });
    }
    else {
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "your link is expired" });
    }
});

app.post('/checkuser', async (req, res) => {
    var data = req.body;
    var fname = data.fname;
    var lname = data.lname;
    var username = data.username;
    var email = data.email;
    var code = activationcode();

    var u = 0, e = 0;

    var q1 = `select username,email from users`;
    d = [];
    var details;
    await execute(q1, d).then((result) => {
        details = result;
    });
    // console.log("res"+details);
    for (let i = 0; i < details.length; i++) {
        if (details[i].username == `${username}`) {
            u++;
        }
        if (details[i].email == `${email}`) {
            e++;
        }
    }
    console.log(u, e);
    if (u > 0 || e > 0) {
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "user already exist" });
    }
    else {

        var q = `insert into users (fname,lname,username,email,activationcode) values ?`;
        var d = [[`${fname}`, `${lname}`, `${username}`, `${email}`, `${code}`]];
        result = await execute(q, d);
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "ok", "code": `${code}` });
    }
});

app.post('/login', async (req, res) => {
    data = req.body;
    var username = req.body.uname;
    var password = req.body.password;
    console.log(username, password);
    var q = `select username,salt,status from users where username='${username}'`;
    d = [];
    result = await execute(q, d);
    if (result.length > 0) {
        if (!(result[0].status == '1')) {
            var code = activationcode();
            var q = `update users set activationcode='${code}' where username='${result[0].username}'`;
            // console.log(q);
            result2 = await execute(q, d);
            res.setHeader('content-Type', 'application/json');
            res.json({ "msg": "inactive", "newcode": `${code}` });
        }
        else {
            var ps = `${password}${result[0].salt}`;
            // console.log("pass at check",ps);
            var q1 = `select * from users where username='${username}' AND password=md5('${ps}')`;
            // console.log(q1);
            result1 = await execute(q1, d);
            // console.log(result1);
            if(result1.length>0)
            {
                const data={
                    username : `${result1[0].username}`,
                    password : `${result1[0].password}`,
                }
                const token=jwt.sign(data,"hello");
                // console.log(token);
                res.setHeader('content-Type', 'application/json')
                .json({ "msg": "ok", "data": result1 ,token:token});
            }
            else
            {
                res.setHeader('content-Type', 'application/json')
                    .json({ "msg": "ok", "data": result1 });
            }
        }
    }
    else {
        // res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "error", "data": "u are not register pls register first" });

    }

});
try {
    app.get('/', (req, res) => {
        console.log("ok");
        res.render('registration');
    });

} catch (error) {
    console.log(error);
}

app.get('/createpassword',async (req,res)=>{
    var sp=url.parse(req.url,true).query;
    var q1=`select username,created_at,update_at from users where activationcode='${sp.code}'`;
        var d=[];
        console.log(q1);
        result2=await execute(q1,d);
        // // console.log(Date.parse(result2[0].created_at),Date.now());
        // if((Date.now()-Date.parse(result2[0].created_at))>30000)
        // {
        //     res.render('activate');
        // }
        // else
        // {
            res.render('createpassword');
        // }
});

app.get('/active',(req,res)=>{
    res.render('activate');
})

app.all('/activatelink',async (req,res)=>{
    let name=req.body.uname;
     // console.log(q);
     var q = `select * from users where username='${name}'`;
     // console.log(q);
     result2 = await execute(q, d);
    if(result2.length>0)
    {
        var code = activationcode();
        var q = `update users set activationcode='${code}' where username='${name}'`;
        result2 = await execute(q, d);
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "newcode", "newcode": `${code}` });
    }
    else
    {
        res.setHeader('content-Type', 'application/json');
        res.json({ "msg": "nocode", "data": 'you are not registerd yet pls register first'});
    }
});
const  verify=(req,res,next)=>{
    if(!(req.cookies.token))
    {
        res.render('login');
    }
    else
    {
        next();
    }

};

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/home',verify, (req, res) => {
    try {
        // console.log("cokkie is : "+req.cookies.token);
        
    } catch (error) {
        console.log(error);
    }
    res.render('home'); 
});




app.listen(8080, (err) => {
    if (err) throw err;
});