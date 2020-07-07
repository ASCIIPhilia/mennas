const fs = require('fs');
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const httpServer = http.createServer(app);

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const atob = s => Buffer.from(s, 'base64');

const port = process.env.PORT || 8080;
const backupTime = 1000 * 60 * 10;
console.log('BACKUP TIME: ' + backupTime);

const authMap = {
    'AuthUser': 'AuthCode'
};

db.defaults({
    blacklist: {}
}).write();

!fs.existsSync('./backup') && fs.mkdirSync('./backup');
setInterval(_ => {
    fs.writeFileSync(`./backup/${new Date().getTime()}.json`, JSON.stringify(db.get('blacklist').value()), 'utf8');
}, backupTime);

app.use(bodyParser.urlencoded({
        extended: true
    }));
app.use(bodyParser.json());

app.get('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');

    var path = req.path;
    var query = req.query;

    if (path == '/blacklist') {
        res.header('Content-Type', 'text/json');

        var list = db.get('blacklist').value();
        console.log("QUERY BLACKLIST!", query.version ? `V${query.version}` : '');
        if (!query.version) {
            Object.values(list).forEach(e => {

                for (var k in e.comments) {
                    var v = e.comments[k];
                    if (v.isBlocked === false) {
                        delete e.comments[k];
                    }
                }

            });
        }
        res.send(JSON.stringify(list));

    } else {
        res.send('{"status" : "Unknown Error"}');
    }
});

app.post('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    var path = req.path;
    if (path == '/request') {
        var data;
        try {
            // Legacy Support
            data = JSON.parse(Object.keys(req.body).pop());
        } catch (e) {
            data = JSON.parse(decodeURIComponent(atob(decodeURIComponent(Object.keys(req.body).pop()))));
        }

        // Legacy Support
        if (data.AUTH_USER || data.AUTH_CODE) {
            data.authUser = data.AUTH_USER;
            data.authCode = data.AUTH_CODE;
            delete data.AUTH_USER;
            delete data.AUTH_CODE;
        }

        var isAuthUser = authMap[data.authUser];
        console.log(isAuthUser, data.authUser);
        if (!isAuthUser) {
            res.header('Content-Type', 'text/json');
            res.send('{"result" : "인증 유저가 아닙니다."}');
            return;
        } else if (isAuthUser && isAuthUser != data.authCode) {
            res.header('Content-Type', 'text/json');
            res.send('{"result" : "인증 코드가 틀립니다."}');
            return;
        } else {
            var isRemoved = false;
            delete data.authCode;
            data.queryDate = new Date();
            if (data.cmd == 'post_blacklist_request') {
                console.log('POST_BLACKLIST_REQUEST:', data);
                data.comments = {};
                data.isBlocked = true;
                delete data.cmd;
                var isExist = db.get('blacklist').value()[data.no];
                if (isExist && isExist.isBlocked) {
                    isRemoved = true;
                    data.isBlocked = false;
                }
                db.get('blacklist').assign({
                    [data.no]: data
                }).write();
            } else if (data.cmd == 'comment_blacklist_request') {
                console.log('COMMENT_BLACKLIST_REQUEST:', data);

                delete data.cmd;
                var blockedPost = db.get('blacklist').get(data.postNo).value();
                if (!blockedPost) {
                    db.get('blacklist').assign({
                        [data.postNo]: {
                            no: data.postNo,
                            isBlocked: false,
                            comments: {}
                        },
                    }).write();
                }
                data.isBlocked = true;
                var isExist = db.get('blacklist').get(data.postNo).get('comments').value()[data.no];
                if (isExist && isExist.isBlocked) {
                    isRemoved = true;
                    data.isBlocked = false;
                }
                db.get('blacklist').get(data.postNo).get('comments').assign({
                    [data.no]: data
                }).write();
            }
            res.header('Content-Type', 'text/json');
            res.send(`{"result" : "${isRemoved ? "블랙리스트에서 제거됨!" : "성공적으로 등록됨!"}"}`);
            return;
        }
    } else {
        res.send('{"status" : "Unknown Error"}');
    }
});

httpServer.listen(port, function () {
    console.log('Listening on port *:' + port);
});
