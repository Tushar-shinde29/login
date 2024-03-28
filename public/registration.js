
async function checkuser()
{
    var res=null;
    var form = document.getElementById("reg");
    const data = new URLSearchParams(new FormData(form));
    var op = await fetch('/checkuser', { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded"}, body: data }).then(response => res=response.json());
    return res;
}



function validatereg()
{
    var e=0;
    var fname=document.getElementById('fname');
    var lname=document.getElementById('lname');
    var email=document.getElementById('email');
    var username=document.getElementById('username');
    document.querySelectorAll("span").forEach((el)=>{
        el.innerHTML="";
    });
    if(fname.value.trim()=="")
    {
        e++;
        fname.style.borderColor="red";
        document.getElementById('ferror').innerHTML="pls enter first name";
    }
    else
    {
        fname.style.borderColor="green";
    }
    if(lname.value.trim()=="")
    {
        e++;
        lname.style.borderColor="red";
        document.getElementById('lnerror').innerHTML="pls enter last name";
    }
    else
    {
        lname.style.borderColor="green";
    }
    var eregx=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if(email.value.trim()=="" || !(email.value.trim().match(eregx)))
    {
        e++;
        email.style.borderColor="red";
        document.getElementById('mailerror').innerHTML="pls enter valid email ";
    }
    else
    {
        email.style.borderColor="green";
    }
    if(!(username.value.length>=5))
    {
        e++;
        username.style.borderColor="red";
        document.getElementById('unameerror').innerHTML="minimum length of username is 5 character";
    }
    else
    {
        username.style.borderColor="green";
    }
    if(e>0)
    {
        return false;
    }
    else
    {
        return true;
    }
}


async function register()
{
    
    if(validatereg())
    {

        document.getElementById('error').innerHTML="";
        var ex=await checkuser();
        if(ex.msg=="ok")
        {
            document.getElementById('error').innerHTML="ur registration is completed and ur activation link is "+`<a href="/createpassword/?code=${ex.code}">http://localhost:8520/createpassword/?code=${ex.code}</a>`;
        }
        else
        {
            document.getElementById('error').innerHTML="user already exist";
        }
    }
    
    
    
}
function ps(c)
{

    window.location.href=`/createpassword/?code=${c}`;
}
function lp()
{

    window.location.href="/login";
}
function re()
{
    window.location.href="/";
}

async function log()
{
    var res=null;
    var form = document.getElementById("reg");
    const data = new URLSearchParams(new FormData(form));
    var op = await fetch('/login', { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data }).then(response => res=response.json());
    return res;
}

async function login()
{
    document.getElementById('lerror').innerHTML="";
    if(document.getElementById("uname").value.trim()=="" || document.getElementById("password1").value.trim()=="")
    {
        document.getElementById('lerror').innerHTML=`pls fill all field`;

    }
    else
    {
        var p=await log();
        if(p.msg=="ok")
        {
            // console.log(p.data[0].id);
            console.log(p.data.length);
            if(p.data.length==0)
            {
                document.getElementById('lerror').innerHTML=`pls enter valid username password`;
            }
            else
            {
                document.getElementById('lerror').innerHTML=`username : ${p.data[0].username} , firstname : ${p.data[0].fname} , lastname : ${p.data[0].lname}`;
            }

        }
        else if(p.msg=="inactive")
        {
            document.getElementById('lerror').innerHTML=`you are registerd but you are not set password so click on this link <a href='/createpassword/?code=${p.newcode}'>click here</a>`;
        }
        else if(p.msg=="error")
        {
            document.getElementById('lerror').innerHTML=`${p.data} <a href='/'>click here </a> for register`;
        }
    }
}



async function setpassword()
{
    var res=null;
    var form = document.getElementById("cpassword");
    const data = new URLSearchParams(new FormData(form));
    // console.log("data",data);
    var op = await fetch('/setpassword', { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data}).then(response => res=response.json());
    return res;
}



async function confirmPSW() {
    const searchParams = new URLSearchParams(window.location.search);
    console.log(searchParams.get('code'));
    document.getElementById('code').value=searchParams.get('code');
    console.log(document.getElementById('password').value,document.getElementById('confirmpassword').value);
    if((document.getElementById('password').value==document.getElementById('confirmpassword').value))
    {
        var ex=await setpassword();
        console.log(ex);
        if(ex.msg=="your link is expired")
        {
            document.getElementById('perror').innerHTML=`register unsuccesfully go for log in click here for login <a href=/>register</a>`;
        }
        else
        {
            document.getElementById('perror').innerHTML=`register succesfully go for log in click here for login <a href=/login>login</a>`;
        }
    }
    else
    {
        document.getElementById('perror').innerHTML="pls enter same passsword";
    }
}
    
