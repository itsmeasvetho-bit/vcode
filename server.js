const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');

const app = express();
const DB = './codes.json';

if (!fs.existsSync(DB)) fs.writeFileSync(DB, '{}');

app.use(express.json());
app.use(express.static('public'));

function load(){
  return JSON.parse(fs.readFileSync(DB));
}

function save(data){
  fs.writeFileSync(DB, JSON.stringify(data,null,2));
}

app.post('/api/code', async (req,res)=>{
  const {name,message} = req.body;

  if(!name) return res.status(400).json({error:'Name required'});

  const code =
    'V-' + Math.random().toString(36).substring(2,8).toUpperCase();

  const db = load();

  db[code] = {
    name,
    message,
    created: new Date().toISOString()
  };

  save(db);

  const qr = await QRCode.toDataURL(code);

  res.json({code, qr});
});

app.get('/api/code/:code',(req,res)=>{
  const db = load();
  const code = req.params.code.toUpperCase();

  if(!db[code])
    return res.status(404).json({error:'V-Code not found'});

  res.json({
    code,
    ...db[code]
  });
});

app.listen(3000,()=>{
  console.log('V-CODE running at http://localhost:3000');
});
