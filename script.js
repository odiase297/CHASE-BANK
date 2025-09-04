const STORAGE_KEY="chase_demo_state";
const LOGIN_KEY="chase_logged_in";

function getState(){
  const raw=localStorage.getItem(STORAGE_KEY);
  if(raw) try{return JSON.parse(raw);}catch(e){}
  return {balance:100000000,tx:[{label:"Initial balance",type:"receive",amount:100000000,status:"successful",date:new Date().toISOString(),balanceAfter:100000000}]};
}
function saveState(s){localStorage.setItem(STORAGE_KEY,JSON.stringify(s));}
function addTx(type,label,amount){
  const st=getState();let status="successful",newBal=st.balance;
  if(type==="send"){
    if(amount>st.balance){status="declined";}
    else{newBal=st.balance-amount;}
  }else{newBal=st.balance+amount;}
  if(status==="successful")st.balance=newBal;
  st.tx.push({label,type,amount,status,date:new Date().toISOString(),balanceAfter:newBal});
  saveState(st);
  renderDashboard();
}
function fmt(n){return n.toLocaleString("en-US",{style:"currency",currency:"USD"});}

function renderLogin(){
  const app=document.getElementById("app");
  app.innerHTML=`
    <div class="card">
      <h1>Chase Bank Login</h1>
      <input id="user" class="input" placeholder="Username">
      <input id="pass" type="password" class="input" placeholder="Password">
      <div id="err" class="error" style="display:none">Invalid username or password</div>
      <button class="btn" onclick="doLogin()">Login</button>
    </div>`;
}
function doLogin(){
  const u=document.getElementById("user").value;
  const p=document.getElementById("pass").value;
  if(u==="odiase297" && p==="1234"){
    localStorage.setItem(LOGIN_KEY,"1");
    renderDashboard();
  }else{
    document.getElementById("err").style.display="block";
  }
}

function renderDashboard(){
  const st=getState();
  const app=document.getElementById("app");
  let txHtml=st.tx.slice().reverse().map(t=>`
    <div class="tx">
      <div><div>${t.label}</div><div style="font-size:12px">${new Date(t.date).toLocaleString()}</div></div>
      <div style="text-align:right">
        <div class="amount">${t.type==="send"?"-":"+"}${fmt(t.amount)}</div>
        <div style="font-size:12px">Bal: ${fmt(t.balanceAfter)}</div>
        <div class="status ${t.status==="successful"?"success":"declined"}">${t.status}</div>
      </div>
    </div>`).join("");
  app.innerHTML=`
    <div class="card">
      <h1>CHASE Account</h1>
      <div class="balance">${fmt(st.balance)}</div>
      <div class="actions">
        <button class="btn" onclick="promptSend()">Send</button>
        <button class="btn secondary" onclick="promptReceive()">Receive</button>
        <button class="btn secondary" onclick="resetDemo()">Reset</button>
      </div>
    </div>
    <div class="card" style="margin-top:20px">
      <h2 style="margin-top:0">Transactions</h2>
      <div>${txHtml||"<div>No transactions yet</div>"}</div>
    </div>
    <div class="logout"><button class="btn secondary" onclick="logout()">Logout</button></div>`;
}

function promptSend(){
  const amt=+prompt("Enter amount to send:","1000");
  if(!amt)return;const to="Recipient";
  addTx("send","To "+to,amt);
  alert(amt>getState().balance?"Declined: insufficient funds":"Transfer successful");
}
function promptReceive(){
  const amt=+prompt("Enter amount to receive:","1000");
  if(!amt)return;const from="Sender";
  addTx("receive","From "+from,amt);
  alert("Money received");
}
function resetDemo(){
  if(confirm("Reset balance to $100,000,000?")){
    localStorage.removeItem(STORAGE_KEY);
    renderDashboard();
  }
}
function logout(){localStorage.removeItem(LOGIN_KEY);renderLogin();}

if(localStorage.getItem(LOGIN_KEY)==="1"){renderDashboard();}else{renderLogin();}
