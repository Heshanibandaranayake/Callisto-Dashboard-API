const express = require('express');
const session = require('express-session');
var cookieParser = require('cookie-parser')
const db = require('./database/db')
const cors = require('cors')
var fs = require('fs');
const jwt = require('jsonwebtoken')
const axios = require('axios')
const bcrypt = require('bcrypt')
const https = require('https');
const path=require('path');
const multer = require('multer');

const configs = require('./config/config.json');

//board key and certificate name
const cert_key_name = configs.cert_key_name;
//access Levels
// const adminAccess = require('./Access/roleadmin.json')
// const userAccess = require('./Access/roleuser.json')
// const guestAccess = require('./Access/roleguest.json')
// const superadminAccess = require('./Access/rolesuperadmin.json')
// const custom1Access = require('./Access/rolecustom1.json');
const { json } = require('body-parser');
const { config } = require('process');

const app = express();
app.use(express.json());
app.use(cors());
//app.use(cookieParser());
// app.use(session({
//     path: '/',
//     secret : 'modem',
//     saveUninitialized:true,
//     resave: false,
//     cookie: { 
//         expires: new Date(Date.now() + 60 * 10000), 
//         maxAge: 60*10000
//       },
//     store: new MongoDBStore({
//         uri: 'my-url',
//         collection: 'sessions'
//   })
//   }));

//URL on which the device api is running
const DRIVER_API_URL = "http://localhost:9000/API/Device/";
//const DRIVER_API_URL = "http://192.168.24.101/API/Device/";

//ip on which this api should run
const NODE_SERVER_IP = configs.node_server_ip;

//board key and certificate name
//const cert_key_name = configs.cert_key_name;

//port on which this api should run
const NODE_SERVER_PORT = 3100;

const appKey = "cZB10RXSMR6wGhI";
const counts = {success: 0, failed: 0};

const DRIVER_CODES = {
    Alarms: "Alarms",
    AFE7444: "AFE7444",
    DSP: "DSP",
    Kintex: "Kintex",
    Modulator: "Modulator",
    Demodulator: "Demodulator",
    NXP: "NXP",
    NXP_Firmware: "NXP_Firmware",
    NXP_RFNetwork: "NXP_RFNetwork",
    NXP_Memory: "NXP_Memory",
    NXP_GSEVirtual : "NXP_GSEVirtual",
    NXP_GSETransReceive : "NXP_GSETransReceive",
    NXP_Router : "NXP_Router",
    Version: "Version",
    Software:"Software",
    Hardware:"Hardware",
    DeviceStat:"DeviceStat",
    Network: "Network",
    PowerSupply: "PowerSupply",
    GPS: "GPS",
    RFBReceive: "RFBReceive",
    RFBTransmit: "RFBTransmit",
    Spartran: "Spartran",
    STM32: "STM32",
    ZYNQ: "ZYNQ",
    CalibrateParam: "CalibrateParam" ,
    Traffic:"Traffic",
    ModemType:"ModemType",
    System:"System",
    MonitorAFE:"MonitorAFE",
    MonitorKintex:"MonitorKintex",
    MonitorZynq: "MonitorZynq",
    MonitorGlobal:"MonitorGlobal",
    MonitorLayerScape:"MonitorLayerScape",
    MonitorSpartran : "MonitorSpartran",
    QoSFirstPriority:"QoSFirstPriority",
    QoSSecondPriority:"QoSSecondPriority",
    QoSThirdPriority:"QoSThirdPriority",
    QoSBandwidthTraffic:"QoSBandwidthTraffic",
    QoSEnable:"QoSEnable",
    QoS:"QoS",
    ZynqUpgrade:"ZynqUpgrade",
    KintexUpgrade:"KintexUpgrade",
    SpartanUpgrade:"SpartanUpgrade",
    STM32Upgrade:"STM32Upgrade",
    FirmwareVersions: "FirmwareVersions",
    FirmwareStatus:"FirmwareStatus",
    ComponentTemperature:"ComponentsTemperature",
    General:"General",
    SelfTestResults:"SelfTestResults",
    SelfTestRun:"SelfTestRun",
    ResetGSE:"ResetGSE",
	ChangeFH : "ChangeFH"
};

app.put('/api/logDB', accessToken, async (req, res) => {
    try{
        console.log("log data",req.body);
        let parameter_name = req.body.parameter_name;
        let current_val = req.body.current_val;
        let prev_val = req.body.prev_val;
        db.pool.query("INSERT INTO parameter_history_log (parameter_name,current_value,prev_value) VALUES (?,?,?)", [parameter_name,current_val,prev_val]);
        
    }
    catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }
});
//QoS file reading
app.get('/api/qosValues', accessToken, async (req, res) => {
    try {
        let values = [];
        let qospath = path.join(__dirname,'../','qos');
        let filename = 'qos_config.txt';
        let full_path = path.join(qospath, filename);

        const fileContent = fs.readFileSync(full_path, 'utf-8');

        // Split the file content by lines
        const lines = fileContent.split('\n');

        // Initialize an array to store the values
        const qosObject = {};


        // Loop through each line and extract values
        lines.forEach((line) => {
            
            if(line.length!=1){
                const [key, value] = line.split(':').map((item) => item.trim());
                qosObject[key] = value;
            }
        });
            
        const qosJSON = JSON.stringify(qosObject, null, 2);
        //console.log(qosJSON);
        // Log the resulting array
        return res.status(200).json(qosJSON);
        //console.log("profiles",profiles);
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

//reading modem switch time
app.get('/api/modemSwitchTime', accessToken, async (req, res) => {
    try {
        let values = [];
        let qospath = path.join(__dirname,'../../driver');
        let filename = 'ModemSwitch.json';
        let full_path = path.join(qospath, filename);
        console.log("path",full_path);
        fs.readFile(full_path, 'utf8', function (err, data) {
            res.end(data);
        });
       
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.put('/api/saveConfigFile', accessToken, async (req, res) => {
    try {
        console.log("calling API");
        let qospath = path.join(__dirname,'../','qos');
        let filePath =  path.join(qospath, 'qos_config.txt');
        console.log(req.body);
        // let data = req.body.replace('"'"', '');
        fs.writeFile(filePath, JSON.stringify(req.body), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("qos_config was saved!");
        });
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const filePath = path.join(__dirname, '../../../../home/user/firmware/binaries');
      cb(null, filePath); // Specify the directory where you want to save the files
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

  app.put('/api/SaveZynqKintexAFE',upload.fields([
    { name: 'DSSSFile', maxCount: 1 }, 
    { name: 'DVBFile', maxCount: 1 },
    { name: 'PSKZynqFile', maxCount: 1 },
    { name: 'PSKKintexFile', maxCount: 1 }
    ]), accessToken,async (req, res) => {
    console.log("file API")
    try {
        console.log(req.body);

        // let s = {
        //     "ModemFirmwareUpgrade": {
        //       "ZynqBitfileName": '"' + req.body.ZynqBitfileName + '"',
        //       "ZynqBitfileSize": '"' + req.body.ZynqBitfileSize + '"',
        //       "KintexBitfileName": '"' + req.body.KintexBitfileName + '"',
        //       "KintexBitfileSize": '"' + req.body.KintexBitfileSize + '"',
        //       "AFEBitfileName": '"' + req.body.AFEBitfileName + '"',
        //       "AFEBitfileSize": '"' + req.body.AFEBitfileSize + '"'
        //     }
        // };
        let s = {
            "ModemFirmwareUpgrade": {
            "DSSSFileName":  req.body.DSSSFileName ,
            "DSSSFileSize":  req.body.DSSSFileSize ,

            "DVBFileName":  req.body.DVBFileName ,
            "DVBFileSize":  req.body.DVBFileSize ,

            "PSKZynqFileName":  req.body.PSKZynqFileName ,
            "PSKZynqFileSize":  req.body.PSKZynqFileSize ,

            "PSKKintexFileName":  req.body.PSKKintexFileName ,
            "PSKKintexFileSize":  req.body.PSKKintexFileSize 
            }
        };
        let jsonString = JSON.stringify(s);
        console.log("json",jsonString);
        await axios({
            url: DRIVER_API_URL + "/ModemFirmwareUpgrade",
            method: "put",
            data: jsonString
        });
    
        return res.status(200).json({
            msg: "Success"
        })
    
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});


app.put('/api/SaveSTM32Spartan',upload.fields([
    { name: 'ZynqBootLFile', maxCount: 1 }, 
    { name: 'KintexBootLFile', maxCount: 1 },
    { name: 'AFEFile', maxCount: 1 },
    { name: 'STMBitfile', maxCount: 1 }, 
    { name: 'SpartanBitfile', maxCount: 1 },
    { name: 'NXPBitfile', maxCount: 1 },
    { name: 'SelfTestZynqBitfile', maxCount: 1 },
    { name: 'SelfTestKintexBitfile', maxCount: 1 }
    ]), accessToken,async (req, res) => {
    console.log("file API")
    try {
        
        
        
        let ZynqBootLFileSize = "";
        if(req.body.ZynqBootLFileName){
            ZynqBootLFileSize = req.body.ZynqBootLFileName;
        }

        let s = {
            "SystemFirmwareUpgrade": {
            "ZynqBootLFileName": req.body.ZynqBootLFileName,
            "ZynqBootLFileSize": req.body.ZynqBootLFileSize,

            "KintexBootLFileName": req.body.KintexBootLFileName,
            "KintexBootLFileSize": req.body.KintexBootLFileSize,

            "AFEFileName": req.body.AFEFileName, 
            "AFEFileSize": req.body.AFEFileSize,   

            "STMBitfileName": req.body.STMBitfileName,
            "STMBitfileSize": req.body.STMBitfileSize,

            "SpartanBitfileName": req.body.SpartanBitfileName,
            "SpartanBitfileSize": req.body.SpartanBitfileSize,

            "NXPBitfileName":req.body.NXPBitfileName,
            "NXPBitfileSize":req.body.NXPBitfileSize,

            "SelfTestZynqBitfileName":req.body.SelfTestZynqBitfileName,
            "SelfTestZynqBitfileSize":req.body.SelfTestZynqBitfileSize,

            "SelfTestKintexBitfileName":req.body.SelfTestKintexBitfileName,
            "SelfTestKintexBitfileSize":req.body.SelfTestKintexBitfileSize,

            }
        };
        let jsonString = JSON.stringify(s);
        console.log(jsonString);
        await axios({
            url: DRIVER_API_URL + "/SystemFirmwareUpgrade",
            method: "put",
            data: jsonString
        });
    
        return res.status(200).json({
            msg: "Success"
        })
   
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

// app.get('/api/getFimwareVersions', accessToken, async (req, res) => {
//     try {
//         let pathFirmware = path.join(__dirname,'../../','UpgradeFiles');
//         const files = fs.readdirSync(pathFirmware);
//         let firmwareFiles = [];

//         for(let p of files)
//         {
//             firmwareFiles.push(p);
//         }

//         res.status(200).json(firmwareFiles);
       
//     } catch (err) {
//         console.log(err.message);
//         return res.status(500).json({
//             msg: err.message
//         })
//     }

// });

//LOGIN =================================================================================
// app.post('/api/login', async (req, res) => {
//     try {
//         const {
//             username,
//             password
//         } = req.body

//         if (!username || !password)
//             return res.status(400).json({
//                 msg: "Please fill in all fields."
//             })

//         const results = await db.pool.query("select * from users where username = ?", [username], (err, res) => {
//             if(err)
//                 console.log(err)
//         });

//         console.log("trying to login ---------- ");

//         if (results.length > 0) {
//             hashedPassword = results[0].password;
//             let userId = results[0].id;

//             bcrypt.compare(password, hashedPassword).then(function (result) {
//                 if (result == true) {


//                     const token = jwt.sign({
//                         uid: userId,
//                         role: results[0].role
//                     }, appKey, {
//                         expiresIn: '2000h'
//                     });

//                     results[0].token = token;
//                     db.pool.query("update users set  token = ? where id = ?", [token, userId]);

//                     //saving logs
//                     db.pool.query("INSERT INTO login_logs (user) VALUES (?)", [userId]);
                    
//                     return res.status(200).json({
//                         msg: "Login success",
//                         "data": results
//                     })
//                     res.cookie('token', token, { expiresIn: '1m' });

//                 } else {
//                     console.log("Inavalid uname/pword");
//                     return res.status(401).json({
//                         msg: "Incorrect Username and/or Password!"
//                     })

//                 }
//             });

//         } else {
//             console.log("No users in the DB with this username");
//             return res.status(401).json({
//                 msg: "Incorrect Username and/or Password!"
//             })
//         }
//     } catch (err) {
//         //req.session.destroy();
//         console.log(err.message);
//         return res.status(500).json({
//             msg: err.message
//         })
//     }
// })

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ msg: "Please fill in all fields." });

        const results = await db.pool.query("SELECT * FROM users WHERE username = ?", [username]);

        if (results.length > 0) {
            const user = results[0];
            const hashedPassword = user.password;
            const userId = user.id;

            if(user.role!='superadmin'){
                if (user.locked) {
                    return res.status(401).json({ msg: "Your account is locked. Please contact admin." ,remainAttempts:3-user.failedAttempts});
                }
            }
            
            bcrypt.compare(password, hashedPassword).then(function (result) {
                if (result == true) {
                    const token = jwt.sign({
                        uid: userId,
                        role: results[0].role
                    }, appKey, {
                        expiresIn: '2000h'
                    });

                    results[0].token = token;
                    db.pool.query("update users set  token = ?, failedAttempts=? where id = ?", [token, 0, userId]);

                    //saving logs
                    db.pool.query("INSERT INTO login_logs (user) VALUES (?)", [userId]);
                    
                    return res.status(200).json({
                        msg: "Login success",
                        "data": results
                    })
                    res.cookie('token', token, { expiresIn: '1m' });
                } else {
                    if(user.role!='superadmin'){
                        // Increment failed login attempts
                        user.failedAttempts = (user.failedAttempts || 0) + 1;
                        if (user.failedAttempts >= 3) {
                            // Lock the account if attempts exceed threshold
                            user.locked = true;
                        }
                        // Save user details back to the database
                        db.pool.query("UPDATE users SET failedAttempts = ?, locked = ? WHERE id = ?", [user.failedAttempts, user.locked, userId]);
                        if(user.failedAttempts==3){
                            return res.status(401).json({ msg: "Your account is locked. Please contact admin." });
                        }else{
                            return res.status(401).json({ msg: "Incorrect Username and/or Password!",remainAttempts:3-user.failedAttempts,role:user.role});
                        }
                    }else{
                        return res.status(401).json({ msg: "Incorrect Username and/or Password!",remainAttempts:3-user.failedAttempts,role:user.role});
                    }
                      
                }
            });
        } else {
            return res.status(401).json({ msg: "Incorrect Username and/or Password!" });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ msg: err.message });
    }
});


//GET ACCESS LEVELS =====================================================================
app.get('/api/get-access-levels', accessToken, async function (req, res) {
    try {
        let cuser = await getTokenUser(req.token);

        if (!cuser)
            return res.status(403);

        fs.readFile(__dirname + "/Access/role" + cuser.role.toLowerCase() + ".json", 'utf8', function (err, data) {
            //console.log("acess***",data);
            res.end(data);
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            msg: err.message
        })
    }
})

//GET ACCESS LEVELS =====================================================================
app.get('/api/get-role-levels', accessToken, async function (req, res) {
    try {
        console.log("role",req.query.role);
        let role =req.query.role;
        // if(role!="" && role!=null && role!=undefined){
        //      role = req.query.role;
        // }
        
        fs.readFile(__dirname + "/Access/role" + role.toLowerCase() + ".json", 'utf8', function (err, data) {
            console.log("role***",data);
            res.end(data);
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            msg: err.message
        })
    }
})
//UPDATE ROLE LEVELS =====================================================================
app.post('/api/update-role-levels', accessToken, async function (req, res) {
    try {
        
        const role = req.query.role;
       
        const data = JSON.stringify(req.body,null,4);
        const jsonStart = '{"accessrights":'+data+'}';
          
        //console.log("dir name", __dirname + "/Access/role" + role + ".json");
        fs.writeFile(__dirname + "/Access/role" + role + ".json", jsonStart, function (err) {
            if (err) throw err;
            console.log('Saved!');
            res.end("Saved");
        });
        return res.status(200).json({
            msg: "Success",
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            msg: err.message
        })
    }
})

//SAVE ACCESS LEVELS =====================================================================
app.post('/api/save-role-levels', accessToken, async function (req, res) {
    try {
        //console.log("req.body", req.body);
        const role = req.query.role;
       
        const data = JSON.stringify(req.body,null,4);
        const jsonStart = '{"accessrights":'+data+'}';
          
        //console.log("dir name", __dirname + "/Access/role" + role + ".json");
        fs.writeFile(__dirname + "/Access/role" + role + ".json", jsonStart, function (err) {
            if (err) throw err;
            console.log('Saved!');
            res.end("Saved");
        });
        return res.status(200).json({
            msg: "Success",
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            msg: err.message
        })
    }
})


app.get('/api/roles', accessToken, async (req, res) => {
    try {
        const files = fs.readdirSync(__dirname + '/Access');
        let profiles = [];

        for(let p of files)
        {
            let profile = p.replace("role", "");
            let profileRemove = profile.replace(".json", "");
            if(profileRemove!="" && profileRemove!=null && profileRemove!=undefined){
                profiles.push(profileRemove);
            }
            
        }

        res.status(200).json(profiles);
        //console.log("profiles",profiles);
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }
});

//TEST API ==============================================================================
app.get('/api/getmsg', function (req, res) {
    fs.readFile(__dirname + "/" + "msg.json", 'utf8', function (err, data) {
        //console.log(data);
        res.end(data);
    });
})

//GET PARAMS FROM DRIVER ================================================================
app.get('/api/driver', accessToken, async (req, res) => {
    try {
        let dCode = req.query.type;
        //console.log("get record",dCode);
        let dCodeFinal = "";
        
        if(!DRIVER_CODES[dCode])
        {
            if(dCode.indexOf("Cali") >= 0) //for calibration - the url is dynamic
            {
                dCodeFinal = dCode;
            }
            else
            {
                return res.status(500).json({
                    msg: "Invalid driver URL"
                })
            }
        }
        else
        {
            dCodeFinal = DRIVER_CODES[dCode];
        }
        //console.log(DRIVER_API_URL + dCodeFinal)
        //console.log(DRIVER_API_URL + req.query.type);
       
        // if(dCodeFinal == 'SelfTestResults'){
        //     response = {
        //         "SelfTestResults": {
        //           "ZynqPCIeloopback": {
        //             "Throughput": "2509.68077786 Mbps",
        //             "CheckReceivedData": "0",
        //             "ErrorCount": "118164"
        //           },
        //           "KintexPCIeloopback": {
        //             "Throughput": "2509.68077786 Mbps",
        //             "CheckReceivedData": "1",
        //             "ErrorCount": ""
        //           },
        //           "ZynqAuroraloopback": {
        //             "Status": "1",
        //             "ErrorCount": ""
        //           },
        //           "KintexAuroraloopback": {
        //             "Status": "1",
        //             "ErrorCount": ""
        //           },
        //           "Auroratest": {
        //             "Time": "60",
        //             "Lane": {
        //               "Lane0": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane1": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane2": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane3": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               }
        //             }
        //           },
        //           "ZynqJesdtest": {
        //             "Time": "",
        //             "Lane": {
        //               "Lane0": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane1": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane2": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane3": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               }
        //             }
        //           },
        //           "KintexJesdtest": {
        //             "Time": "",
        //             "Lane": {
        //               "Lane0": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane1": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane2": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               },
        //               "Lane3": {
        //                 "BitReceived": "234",
        //                 "ErrorCount": "33",
        //                 "BER": "0.000000000034"
        //               }
        //             }
        //           }
        //         }
        //       };
        //       console.log("data",response);
        //       res.json(response);
        // }
        const response = await axios({
            url: DRIVER_API_URL + dCodeFinal,
            method: "get",
        });
        counts.success++;
        
        // if(dCode=='QoS'){
        //     console.log("responce",response.data);
        // }
        //console.log("data",response.data);
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        res.status(200).json(response.data);
       
        
    } catch (err) {
        //console.log(err);

        counts.failed++;
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

//POST PARAMS TO DRIVER =================================================================
app.put('/api/driver', accessToken, async (req, res) => {
    let cuser = await getTokenUser(req.token);
    //console.log(req.body);
    
    if (!cuser)
        return res.status(403);
    try {
        //console.log("Request-------------------------------------------------------------",req.query.type);
        let dCode = req.query.type;
        if(!DRIVER_CODES[dCode])
        {
            
            return res.status(500).json({
                msg: "Invalid driver URL"
            })
        }
        //console.log(dCode);
        //const response = "";
        //if(req.query.type != "Alarms"){
            // if(dCode=='ModemType'){
            //         response = await axios({
            //         url: DRIVER_API_URL + "/" + DRIVER_CODES[dCode],
            //         method: "put",
            //         data: JSON.stringify(req.body)
            //     });
            //     console.log("res",response);
            // }else{
            //         response = await axios({
            //         url: DRIVER_API_URL + "/" + DRIVER_CODES[dCode],
            //         method: "put",
            //         data: JSON.stringify(req.body)
            //     });
            //}
        if(dCode == 'QoS'){
            console.log(JSON.stringify(req.body))

        }
       
        const response = await axios({
            url: DRIVER_API_URL + "/" + DRIVER_CODES[dCode],
            method: "put",
            data: JSON.stringify(req.body)
        });
            
           
        //}
         //console.log("Response-------------------------------------------------------------",response.status);
        console.log("decode",dCode);
        //getting last saved values
        if(dCode!='QoSFirstPriority' && dCode!='QoSSecondPriority' && dCode!='QoSThirdPriority'){
            let lsq = 'SELECT * FROM `activity_logs` WHERE id IN (SELECT MAX(id) FROM `activity_logs` GROUP BY tab, prop)';
            const lsResult = await db.pool.query(lsq);
            let latestValues = {};
    
            for(let lval of lsResult)
            {
                let lKey = lval["tab"] + "_" + lval["prop"];
                latestValues[lKey] = lval["val"];
            }
            let modemMode = '';
            //saving logs
            for (let [tab, params] of Object.entries(req.body)) {
                for (let [pkey, pval] of Object.entries(params)) {
                    console.log('--',pkey,pval);
                    //if(dCode == 'Modulator'){
                        if(pkey == 'ModTxModeofOperation'){
                            if(pval == 1){
                                modemMode = 'DSSS'
                            }else if(pval == 2){
                                modemMode = 'PSK'
                            }else if(pval == 3){
                                modemMode = 'DVB-S2X'
                            }else if(pval == 4){
                                modemMode = 'DSSS-FH'
                            }else if(pval == 5){
                                modemMode = 'PSK-FH'
                            }else if(pval == 6){
                                modemMode = 'PSK-FH-EPM'
                            }
                        }
                    //}
                    let existingVal = latestValues[tab + "_" + pkey];
                    //console.log("activity*******",tab,pkey,pval);
                    if(existingVal == undefined || existingVal != pval)
                        db.pool.query("INSERT INTO activity_logs (user, tab, prop, val,modem_mode) VALUES (?,?,?,?,?)", [cuser.id, tab, pkey, pval,modemMode]);
                }
            }
        }
        

        
        // if(response.status!=200){
        //     res.status(102);
        // }else{
        //     res.status(200).json(response.data);
        // }
        
        res.status(200).json(response.data);
        

    } catch (err) {
        //console.log(err);
        res.status(500).json({
            message: err
        });
    }
});

app.post('/api/driver', accessToken, async (req, res) => {
    try {
        let dCode = req.query.type;
        let dCodeFinal = "";
        if(!DRIVER_CODES[dCode])
        {
            if(dCode.indexOf("Cali") >= 0) //for calibration - the url is dynamic
            {
                dCodeFinal = dCode;
            }
            else
            {
                return res.status(500).json({
                    msg: "Invalid driver URL"
                })
            }
        }
        else
        {
            dCodeFinal = DRIVER_CODES[dCode];
        }
        console.log(DRIVER_API_URL + dCodeFinal)
        //console.log(DRIVER_API_URL + req.query.type);
        console.log("req body",req.body);
        response = await axios({
            url: DRIVER_API_URL + dCodeFinal,  
            method: "get",
            data: JSON.stringify(req.body)
        });
            
        counts.success++;
       
        res.status(200).json(response.data);
        
    } catch (err) {
        //console.log(err);

        counts.failed++;
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.put('/api/reconfigure', accessToken, async (req, res) => {
    try{
        const type = req.query.type;
        let s = {
            "type":{
                "type": type
            }
            
        }
        let jsonString = JSON.stringify(s);
        console.log("-------------", DRIVER_API_URL + "/Reconfig"+jsonString);
        axios({
            url: DRIVER_API_URL + "/Reconfig",
            method: "put",
            data:jsonString

        });
    }catch{
        res.status(500).json({
            message: err
        });
    }
})
//POST PARAMS TO Alarm =================================================================
app.put('/api/alarmSave', accessToken, async (req, res) => {
    try {
        
        let dCode = req.query.type;

        // if(!DRIVER_CODES[dCode])
        // {
        //     return res.status(500).json({
        //         msg: "Invalid driver URL"
        //     })
        // }
        //if(req.body.Alarms!=undefined || req.body.Alarms!=null){
            //console.log("req body",req.body.Alarms);
            db.pool.query("INSERT INTO alarm_logs (alarm_type) VALUES (?)", req.body.Alarms);
        //}
        

        //}
       // console.log("res",res.status(200).json(response.data))
        res.status(200).json();
       
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err
        });

    }
});

//POST PARAMS TO Json file =================================================================
app.put('/api/profileSave', accessToken, async (req, res) => {
    //console.log("Req",req);
    let cuser = await getTokenUser(req.token);
    
    if (!cuser)
        return res.status(403);
        
    try {
        //console.log("Request-------------------------------------------------------------",req.query.type, req.query.profile);

        let dCode = req.query.type;
        //console.log("profileSave",req.body);
        if(!DRIVER_CODES[dCode])
        {
            return res.status(500).json({
                msg: "Invalid driver URL"
            })
        }

        //save to json file
        let profile = req.query.profile;
        let profileName = req.query.profileName;

        // if(req.query.type == "Modulator"){
        //     oldProfileFile = __dirname +"/storage/mod/final/" + profile + ".json";
        //     profileFile = __dirname +"/storage/mod/final/" + profileName + ".json";
        // }else if(req.query.type == "Demodulator"){
        //     oldProfileFile = __dirname +"/storage/demod/final/" + profile + ".json";
        //     profileFile = __dirname +"/storage/demod/final/" + profileName + ".json";
        // }
        //console.log("profileName",profileName);
        if(req.query.modemMode == "DSSS"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/DSSS - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/DSSS - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/DSSS - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/DSSS - " + profileName + ".json";
            }
        }else if(req.query.modemMode == "PSK"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/PSK - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/PSK - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/PSK - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/PSK - " + profileName + ".json";
            }
        }else if(req.query.modemMode == "DVB-S2X"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/DVB-S2X - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/DVB-S2X - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/DVB-S2X - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/DVB-S2X - " + profileName + ".json";
            }
        }else if(req.query.modemMode == "DSSS-FH"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/DSSS-FH - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/DSSS-FH - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/DSSS-FH - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/DSSS-FH - " + profileName + ".json";
            }
        }else if(req.query.modemMode == "PSK-FH"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/PSK-FH - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/PSK-FH - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/PSK-FH - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/PSK-FH - " + profileName + ".json";
            }
        }else if(req.query.modemMode == "PSK-FH-EPM"){
            if(req.query.type == "Modulator"){
                oldProfileFile = __dirname +"/storage/mod/final/PSK-FH-EPM - " + profile + ".json";
                profileFile = __dirname +"/storage/mod/final/PSK-FH-EPM - " + profileName + ".json";
            }else if(req.query.type == "Demodulator"){
                oldProfileFile = __dirname +"/storage/demod/final/PSK-FH-EPM - " + profile + ".json";
                profileFile = __dirname +"/storage/demod/final/PSK-FH-EPM - " + profileName + ".json";
            }
        }
        
        
        // Check if profileName is different from profile
        if(profile!='demodNewProfile' && profile!='modNewProfile'){
            if (profileName !== profile) {   
                    // Delete the old profile file
                    fs.unlink(oldProfileFile, function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log(profile + ".json was deleted!");
                    });
            }
        } 
        fs.writeFile(profileFile, JSON.stringify(req.body), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(profile+ ".json was saved!");
        });
        
        
       
        //getting last saved values
        // let lsq = 'SELECT * FROM `activity_logs` WHERE id IN (SELECT MAX(id) FROM `activity_logs` GROUP BY tab, prop)';
        // const lsResult = await db.pool.query(lsq);
        // let latestValues = {};

        // for(let lval of lsResult)
        // {
        //     let lKey = lval["tab"] + "_" + lval["prop"];
        //     latestValues[lKey] = lval["val"];
        // }

        // //saving logs
        // for (let [tab, params] of Object.entries(req.body)) {
        //     for (let [pkey, pval] of Object.entries(params)) {
        //         let existingVal = latestValues[tab + "_" + pkey];
        //         console.log("activity*******",tab,pkey,pval);
        //         if(existingVal == undefined || existingVal != pval)
        //             db.pool.query("INSERT INTO activity_logs (user, tab, prop, val) VALUES (?,?,?,?)", [cuser.id, tab, pkey, pval]);
        //     }
        // }

        res.status(200).json({msg:"success"});

    } catch (err) {
        //console.log(err);
        res.status(500).json({
            message: err
        });
    }
});

//GET FREQUENCY HOPPING PROFILES =================================================================
app.get('/api/fhop-profiles', accessToken, async (req, res) => {
    try {
        const files = fs.readdirSync(__dirname + '/storage/freq-hopping/final');
        let profiles = [];

        for(let p of files)
        {
            let profile = p.replace(".txt", "");
            profiles.push(profile);
        }

        res.status(200).json(profiles);
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.get('/api/mod-profiles', accessToken, async (req, res) => {
    try {
        
        const files = fs.readdirSync(__dirname + '/storage/mod/final/');
        
        let profiles = [];

        for(let p of files)
        {
            let profile = p.replace(".json", "");
            profiles.push(profile);
        }

        res.status(200).json(profiles);
        //console.log("profiles",profiles);
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.get('/api/mod-values', accessToken, async (req, res) => {
    try {
        let profile = req.query.profile;
        //const data = fs.readFileSync( __dirname + '/storage/mod/final/' + profile + '.json', 'utf8');
        fs.readFile(__dirname + '/storage/mod/final/' + profile+ '.json','utf8',(err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            var obj = '';
            //console.log("jsonString",jsonString);
            if(jsonString){
                obj = JSON.parse(jsonString);
            }
            

            //console.log(obj);
            
            // console.log(jsonString);
            // console.log(json.parse(jsonString));
        
            res.status(200).json(obj);
          });
       
    } catch (err) {
        //console.log(err);

        counts.failed++;
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.get('/api/demod-profiles', accessToken, async (req, res) => {
    try {
        const files = fs.readdirSync(__dirname + '/storage/demod/final');
        let profiles = [];

        for(let p of files)
        {
            let profile = p.replace(".json", "");
            profiles.push(profile);
        }

        res.status(200).json(profiles);
        //console.log("profiles",profiles);
    } catch (err) {
        console.log(err);

        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

app.get('/api/demod-values', accessToken, async (req, res) => {
    try {
        let profile = req.query.profile;
        //const data = fs.readFileSync( __dirname + '/storage/mod/final/' + profile + '.json', 'utf8');
        fs.readFile(__dirname + '/storage/demod/final/' + profile+ '.json','utf8',(err, jsonString) => {
            if (err) {
              console.log("File read failed:", err);
              return;
            }
            var obj = '';
            //console.log("jsonString",jsonString);
            if(jsonString){
                obj = JSON.parse(jsonString);
            }
            
            // console.log(jsonString);
            // console.log(json.parse(jsonString));
        
            res.status(200).json(obj);
          });
       
    } catch (err) {
        //console.log(err);

        counts.failed++;
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});


//GET FREQUENCY HOPPING PARAMS =================================================================
app.get('/api/fhop-values', accessToken, async (req, res) => {
    try {
        let profile = req.query.profile;

        const data = fs.readFileSync( __dirname + '/storage/freq-hopping/final/' + profile + '.txt', 'utf8');
        console.log(data);
        
        res.status(200).json(data);
    } catch (err) {
        //console.log(err);

        counts.failed++;
        //console.log(counts, (counts.failed/counts.success).toFixed(2));
        return res.status(500).json({
            msg: err.message
        })
    }

});

//SAVE FREQUENCY HOPPING PARAMS =================================================================
app.put('/api/fhop-values', accessToken, async (req, res) => {
    let cuser = await getTokenUser(req.token);

    if (!cuser)
        return res.status(403);
        
    try {
        console.log(req.body);

        let profile = req.query.profile;
        let data = req.body.data;
        data = data.join("\r\n");

        fs.writeFileSync(__dirname + '/storage/freq-hopping/final/' + profile + '.txt', data);

        res.status(200).json({msg: "success"});

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err
        });
    }
});

//USERS: GET ALL ========================================================================
app.get('/api/users', accessToken, async (req, res) => {
    try {
        const result = await db.pool.query("select id, fullname, username, role,locked from users");
        return res.status(200).json({
            msg: "success",
            "data": result
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: err.message
        })
    }
});

//USERS: GET ONE ========================================================================
app.get('/api/users/:id', accessToken, async (req, res) => {
    try {
        const result = await db.pool.query("select id, fullname, username, role,locked from users where id=" + req.params.id);
        jwt.verify(req.token, appKey, function (err, data) {
            if (err) {
                res.status(200).json({
                    msg: "Invalid Token"
                })
            } else {
                try {

                    return res.status(200).json({
                        msg: "success",
                        "data": result
                    })
                } catch (err) {
                    return res.status(500).json({
                        msg: err.message
                    })
                }
            }

        })
    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }
});

//USERS: ADD ============================================================================
app.post('/api/users', accessToken, async (req, res) => {
    try {
        const {
            username,
            fullname,
            role,
            password
        } = req.body

        if (!username || !fullname || !role || !password)
            return res.status(400).json({
                msg: "Please fill in all fields"
            })

        if (username.length < 4)
            return res.status(400).json({
                msg: "Username should be atleast 4 characters long"
            })

        if (!validatePassword(password))
            return res.status(400).json({
                msg: "Invalid password"
            })

        const results = await db.pool.query("select * from users where username = ?", [username]);

        if (results.length > 0) {
            return res.status(400).json({
                msg: "This username has been already taken"
            })
        } else {
            bcrypt.hash(password, 10).then(async function (hash) {
                try {
                    const result = db.pool.query("INSERT INTO users (username, fullname, role, password) VALUES (?,?,?,?)", [username, fullname, role, hash]);
                    //console.log(result);

                    return res.status(200).json({
                        msg: "User has been successfully added"
                    })

                } catch (err) {
                    return res.status(500).json({
                        msg: err.message
                    })
                }
            });
        }

    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }
})

//USERS: UPDATE =========================================================================
app.put('/api/users/:id', accessToken, async (req, res) => {
    try {
        const {
            username,
            fullname,
            role,
            locked
        } = req.body

        if (!username || !fullname || !role)
            return res.status(400).json({
                msg: "Please fill in all fields"
            })

        if (username.length < 4)
            return res.status(400).json({
                msg: "Username should be atleast 4 characters long"
            })

        const results = await db.pool.query("select * from users where username = ? and id <> ?", [username, req.params.id]);
        const Idresults = await db.pool.query("select * from users where id = ?", [req.params.id]);

        if (Idresults.length == 0) {
            return res.status(400).json({
                msg: "Invalid user ID"
            })
        } else if (results.length > 0) {
            return res.status(400).json({
                msg: "This username has been already taken"
            })
        } else {
            try {
                const result = await db.pool.query("update users set username = ?, fullname = ?, role = ?, locked=? ,failedattempts=? where id = ?", [username, fullname, role,locked,0, req.params.id]);
                //console.log(result);

                return res.status(200).json({
                    msg: "User has been successfully updated"
                })

            } catch (err) {
                return res.status(500).json({
                    msg: err.message
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }
});

//USERS: UPDATE PASSWORD ================================================================
app.put('/api/users/:id/password', accessToken, async (req, res) => {
    try {
        const password = req.body.password

        if (!password)
            return res.status(400).json({
                msg: "Please provide a password"
            })

        if (!validatePassword(password))
            return res.status(400).json({
                msg: "Invalid password"
            })

        const Idresults = await db.pool.query("select * from users where id = ?", [req.params.id]);

        if (Idresults.length == 0) {
            return res.status(400).json({
                msg: "Invalid user ID"
            })
        } else {
            try {
                const hash = bcrypt.hashSync(password, 10);
                const updateresult = db.pool.query("update users set password = ? where id = ?", [hash, req.params.id]);


                return res.status(200).json({
                    msg: "Passsword has been successfully updated"
                })

            } catch (err) {
                return res.status(500).json({
                    msg: err.message
                })
            }
        }
    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }
});

//USERS: SELF RESET PASSWORD  ===========================================================
app.put('/api/resetpassword/:id', accessToken, async (req, res) => {
    try {
        if (!req.body.password)
            return res.status(400).json({
                msg: "Please provide a password"
            })

        if (!validatePassword(req.body.password))
            return res.status(400).json({
                msg: "Invalid password"
            })

        const userinputlastpassword = req.body.password;
        const result = await db.pool.query("select * from users where id=" + req.params.id);
        const getlastpassword = result[0].password

        bcrypt.compare(userinputlastpassword, getlastpassword).then(function (result) {
            console.log(result);
            if (result == true) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                const updateresult = db.pool.query("update users set password = ? where id = ?", [hash, req.params.id]);
                return res.status(200).json({
                    msg: "update success"
                })
            } else {
                return res.status(401).json({
                    msg: "Existing password is incorrect"
                })
            }
        });
    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }

});


//USERS: DELETE =========================================================================
app.delete('/api/users/:id', accessToken, async (req, res) => {
    let id = req.params.id;
    try {
        const result = await db.pool.query("delete from users where id = ?", [id]);
        return res.status(200).json({
            msg: "User deleted"
        })
    } catch (err) {
        return res.status(500).json({
            msg: err.message
        })
    }
});

//LOGS: GET ALL LOGIN LOGS ========================================================================
app.get('/api/login-logs', accessToken, async (req, res) => {
    try {
        let q = 'SELECT u.fullname AS `user`, l.login_date AS `date` FROM login_logs l LEFT JOIN users u ON u.id = l.user WHERE 1=1 ';

        let fdate = req.query.fdate;
        let tdate = req.query.tdate;

        if(fdate)
            q += ' AND DATE(l.login_date) >= "'+ fdate +'" ';

        if(tdate)
            q += ' AND DATE(l.login_date)<= "'+ tdate +'" ';

        q += ' ORDER BY l.login_date desc LIMIT 100';

        const result = await db.pool.query(q);
        console.log("result",result);
        return res.status(200).json({
            msg: "success",
            "data": result
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: err.message
        })
    }
});

//LOGS: GET ALL Alarm LOGS ========================================================================
app.get('/api/alarm-logs', accessToken, async (req, res) => {
    try {
        let q = 'SELECT u.alarm_type AS `alarm_type`, Max(u.date_time) AS `stop`, Min(u.date_time) as `start` FROM alarm_logs u WHERE 1=1';
        let fdate = req.query.fdate;
        let tdate = req.query.tdate;
        if(fdate)
            q += ' AND DATE( u.date_time) >= "'+ fdate +'" ';

        if(tdate)
            q += ' AND DATE( u.date_time)<= "'+ tdate +'" ';

        q += ' group by alarm_type';
        console.log("query",q);

        const result = await db.pool.query(q);
        console.log("result",result);
        return res.status(200).json({
            msg: "success",
            "data": result
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: err.message
        })
    }
});

//LOGS: GET ALL CONFIG LOGS ========================================================================
app.get('/api/config-logs', accessToken, async (req, res) => {
    try {
        console.log("req",req.query);
        let fdate = req.query.fdate;
        let tdate = req.query.tdate;
        let modemMode = req.query.modemMode;
        let s = req.query.search;

        let q = 'SELECT u.fullname AS `user`, l.tab, l.prop, l.val, l.login_date AS `date` FROM activity_logs l LEFT JOIN users u ON u.id = l.user WHERE (l.tab LIKE "%'+ s +'%" OR l.prop LIKE "%'+ s +'%") AND l.modem_mode ="' +modemMode+ '"';

        if(fdate)
            q += ' AND DATE(l.login_date) >= "'+ fdate +'" ';

        if(tdate)
            q += ' AND DATE(l.login_date)<= "'+ tdate +'" ';

        q += ' ORDER BY l.login_date desc LIMIT 100';

        const result = await db.pool.query(q);
        return res.status(200).json({
            msg: "success",
            "data": result
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: err.message
        })
    }
});

//VALIDATE TOKEN ========================================================================
async function accessToken(req, res, next) {
    try {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            req.token = bearerToken;

            next();
        } else {
            res.sendStatus(403)
        }
    } catch (err) {
        //console.log(err.message);
        return res.status(500).json({
            msg: err.message
        })
    }
}

//=======================================================================================
async function getTokenUser(token) {
    try {
        const decoded = jwt.verify(token, appKey);
        let result = await db.pool.query("select id, fullname, username, role from users where id='" + decoded.uid + "'");

        if (!result || result.length == 0)
            return false;

        result = result[0];
        return result;
    } catch (err) {
        return false
    }
}

function validatePassword(pw) {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    return pattern.test(pw);
}

//port connection
// const server = app.listen(NODE_SERVER_PORT, NODE_SERVER_IP, () => {
//     console.log('Server started on '+ NODE_SERVER_IP + ':' + NODE_SERVER_PORT + '...');
// });



// const options = {
//     key: fs.readFileSync('../certs/'+cert_key_name+'.key'),
//     cert: fs.readFileSync('../certs/'+cert_key_name+'.crt')
// }
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')

}
//const PORT = process.env.PORT || NODE_SERVER_PORT
const server = https.createServer(options, app).listen(NODE_SERVER_PORT,NODE_SERVER_IP, console.log('Server started on '+ NODE_SERVER_IP + ':' + NODE_SERVER_PORT + '...'))

// const server = app.listen(NODE_SERVER_PORT, NODE_SERVER_IP, () => {
//     console.log('Server started on '+ NODE_SERVER_IP + ':' + NODE_SERVER_PORT + '...');
// });

server.keepAliveTimeout = 900 * 1000;
server.headersTimeout = 35 * 1000;