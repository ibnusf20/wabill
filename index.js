const http = require("http")
const path = require("path")
const hostname = 'localhost';
const express = require("express")
const qrcode = require("qrcode")
const socketIO = require("socket.io")
const { rm } = require("fs")
const axios = require('axios')

const BASE_DIR = (process.env.BASE_DIR || __dirname).trim()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, delay } = require('baileys')
const pino = require('pino')

const port = 4000
const app = express()
const server = http.createServer(app)
const io = socketIO(server)

app.use(express.json())
app.use("/assets", express.static(path.join(BASE_DIR, "client", "assets")))

app.get("/", (req, res) => {
  res.sendFile("index.html", {
    root: path.join(BASE_DIR, "client"),
  })
})

let qr
let qrDataUrl
let sock
let connected
let wa

const sendMessageWTyping = async (waSock, msg, jid) => {
  await waSock.presenceSubscribe(jid)
  await delay(100)
  await waSock.sendPresenceUpdate('composing', jid)
  await delay(500)
  await waSock.sendPresenceUpdate('paused', jid)
  await waSock.sendMessage(jid, msg)
  await delay(500)
}

function connectionUpdate(update) {
  const setQR = qr => {
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error("QR Code error:", err)
        return
      }
      qrDataUrl = url
      sock?.emit("qr", url)
      sock?.emit("log", "QR Code received, please scan!")
    })
  }

  if (update.qr) {
    console.log("QR received from WhatsApp, generating image...")
    qr = update.qr
    setQR(qr)
  }

  if (update === 'qr') {
    setQR(qr)
  }

  if (update.connection === 'open' || update === 'connected') {
    connected = true
    qr = ''
    qrDataUrl = ''
    sock?.emit("qrstatus", "./assets/check.svg")
    sock?.emit("log", "WhatsApp terhubung!")
  }

  if (update.connection === 'close') {
    connected = false
    sock?.emit("qrstatus", "./assets/loader.gif")
  }
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('wabill_session')
  const waSock = makeWASocket({
    browser: ["Wabill", "Chrome", "1.2.0"],
    auth: state,
    syncFullHistory: false,
    logger: pino({
      level: 'warn'
    })
  })

  waSock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    console.log("Baileys connection.update:", JSON.stringify({qr: update.qr ? "present" : undefined, connection, ...(connection === 'close' ? {lastDisconnect: lastDisconnect?.error?.message, statusCode: lastDisconnect?.error?.output?.statusCode} : {})}))
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWhatsApp()
      } else {
        console.log('Connection closed. You are logged out.')
        rm("./wabill_session", { recursive: true }, (err) => {
          if (err && err.code == "ENOENT") {
            // file doens't exist
            console.info("Folder doesn't exist, won't remove it.");
          } else if (err) {
            console.error("Error occurred while trying to remove folder.");
            console.error(err)
          }
        })
        connectToWhatsApp()
      }
    }

    connectionUpdate(update)
  })
  waSock.ev.on("creds.update", saveCreds);
  waSock.ev.on("messages.upsert", async m => {
      const msg = m.messages[0];
//   console.log(messages);
        if(!msg.key.fromMe && m.type === "notify"){
          console.log("nomer: "+msg.key.remoteJid);
          console.log("pesan: "+msg.message.conversation);
            if(msg.message) {
                const noWa = msg.key.remoteJid;
                const pesan = msg.message.conversation;
                await waSock.readMessages([msg.key]);
                // const pesanMasuk = pesan.toLowerCase();
                if(msg.message.conversation){
                  axios.get("https://script.google.com/macros/s/AKfycbxs7s5W2ajDWvyN1O8POyu6ZTCo045W0JC74OnGQrxedowyPA4T6dmQ_EaEIV6mKlE-/exec?whatsapp="+noWa.replace('@s.whatsapp.net',''))
                  .then(async (response) => {
                    console.log(response.data);
                    const {data,success,pesanerror} = response.data;
                    if(success) {
                    await waSock.sendMessage(noWa, {text: `*${data.periode}*\n\nNama: *${data.nama}*\nJumlah Absen: *${data.absen} Hari*\nJumlah Libur: *${data.libur} Hari*\nJumlah Alpa: *${data.alpa} Hari*\nGaji: *${data.gaji}*\n\n*Absen:*\nTanggal 1: ${data.a1}\nTanggal 2: ${data.a2}\nTanggal 3: ${data.a3}\nTanggal 4: ${data.a4}\nTanggal 5: ${data.a5}\nTanggal 6: ${data.a6}\nTanggal 7: ${data.a7}\nTanggal 8: ${data.a8}\nTanggal 9: ${data.a9}\nTanggal 10: ${data.a10}\nTanggal 11: ${data.a11}\nTanggal 12: ${data.a12}\nTanggal 13: ${data.a13}\nTanggal 14: ${data.a14}\nTanggal 15: ${data.a15}\nTanggal 16: ${data.a16}\nTanggal 17: ${data.a17}\nTanggal 18: ${data.a18}\nTanggal 19: ${data.a19}\nTanggal 20: ${data.a20}\nTanggal 21: ${data.a21}\nTanggal 22: ${data.a22}\nTanggal 23: ${data.a23}\nTanggal 24: ${data.a24}\nTanggal 25: ${data.a25}\nTanggal 26: ${data.a26}\nTanggal 27: ${data.a27}\nTanggal 28: ${data.a28}\nTanggal 29: ${data.a29}\nTanggal 30: ${data.a30}`})
                    // await waSock.sendMessage(noWa, {text: `*${data.periode}*\n\nNama: *${data.nama}*\nJumlah Absen: *${data.absen} Hari*\nGaji: *${data.gaji}*\nKontrak Sampai: *${data.kontrak}*\n\nKeterangan: *${data.keterangan}*\n\n*Absen:*\nTanggal 1: ${data.a1}\nTanggal 2: ${data.a2}\nTanggal 3: ${data.a3}\nTanggal 4: ${data.a4}\nTanggal 5: ${data.a5}\nTanggal 6: ${data.a6}\nTanggal 7: ${data.a7}\nTanggal 8: ${data.a8}\nTanggal 9: ${data.a9}\nTanggal 10: ${data.a10}\nTanggal 11: ${data.a11}\nTanggal 12: ${data.a12}\nTanggal 13: ${data.a13}\nTanggal 14: ${data.a14}\nTanggal 15: ${data.a15}\nTanggal 16: ${data.a16}\nTanggal 17: ${data.a17}\nTanggal 18: ${data.a18}\nTanggal 19: ${data.a19}\nTanggal 20: ${data.a20}\nTanggal 21: ${data.a21}\nTanggal 22: ${data.a22}\nTanggal 23: ${data.a23}\nTanggal 24: ${data.a24}\nTanggal 25: ${data.a25}\nTanggal 26: ${data.a26}\nTanggal 27: ${data.a27}\nTanggal 28: ${data.a28}\nTanggal 29: ${data.a29}\nTanggal 30: ${data.a30}\nTanggal 31: ${data.a31}`});
                    
                    }
                    // else{
                    //   if(pesanerror){
                    //       await waSock.sendMessage(noWa, {text:`${pesanerror}`})
                    //   }
                    // }
                  });
              }
            //   //jnt express
            //   if(msg.message.conversation){
            //       axios.get("https://api.binderbyte.com/v1/track?api_key=de15ec7f088a4f5504cbd681fb543ce344b3e1505468146b0f2495a30db55127&courier=jnt&awb="+pesan)
            //       .then(async (response) => {
            //         console.log(response.data);
            //         const {status, message, data, summary, awb, courier, history, date, desc, location} = response.data;
            //         let str;
            //         if(status) {
            //          await waSock.sendMessage(noWa, {text: `📦 Ekspedisi : ${data.summary.courier}\n📮 Status : ${data.summary.status}\n📃 Resi : ${data.summary.awb}\n\n🚧 Detail : \n${data.history[0].date}\n${data.history[0].desc}\n${data.history[0].location}`});
            //         }
            //       });
            //   }
            //   //akhir jnt
      }		
    }	
    	
    });
  wa = waSock
}

connectToWhatsApp()

io.on("connection", async (socket) => {
  console.log("Socket.IO client connected")
  sock = socket
  if (connected) {
    console.log("Client connected, already authenticated")
    connectionUpdate("connected")
  } else if (qrDataUrl) {
    console.log("Client connected, sending cached QR image")
    socket.emit("qr", qrDataUrl)
    socket.emit("log", "QR Code received, please scan!")
  } else if (qr) {
    console.log("Client connected, generating QR from stored string")
    connectionUpdate('qr')
  } else {
    console.log("Client connected, no QR available yet - waiting for Baileys...")
  }
})

app.post("/send-message", async (req, res) => {
  const message = req.body.message
  const number = req.body.number

  if (connected) {
    wa.onWhatsApp(number)
      .then(data => {
        if (data[0]?.jid) {
          sendMessageWTyping(wa, { text: message }, data[0].jid)
            .then((result) => {
              res.status(200).json({
                status: true,
                response: result,
              })
            })
            .catch((err) => {
              res.status(500).json({
                status: false,
                response: err,
              })
            })
        } else {
          res.status(500).json({
            status: false,
            response: `Nomor ${number} tidak terdaftar.`,
          })
        }
      })
      .catch(async err => {
        console.log(err)
        if (err?.output?.statusCode === DisconnectReason.connectionClosed) {
          console.log('di sini error ')
        }
      })
  } else {
    res.status(500).json({
      status: false,
      response: `WhatsApp belum terhubung.`,
    })
  }
})

server.listen(port, hostname, () => {
 console.log(`Server running at http://${hostname}:${port}/`);
})