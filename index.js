
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));


//const members = httpcodeforces.com/api/contest.list?gym=true;
app.get("/", function (req, res) {

    res.sendFile(__dirname + "/front.html");


    //res.send("Server is UP and running")

})

app.post("/", function (req, res) {
    const handle = req.body.userHandle;
    // var handle1 = document.getElementById("handle");
    const url = "https://codeforces.com/api/problemset.problems";
    const urlrat = "https://codeforces.com/api/user.info?handles=" + handle;
    const usersum = "https://codeforces.com/api/user.status?handle=" + handle;

    var data;
    //console.log(response.statusCode)

    var rat;
    var user_arr = [];
    https.get(urlrat, function (res1) {
        res1.on("data", function (data) {
            rat = (JSON.parse(data)).result[0].rating;
            console.log(rat);
            https.get(usersum, function (res2) {
                data = "";
                res2.on("data", function (chunk) {
                    if (!data) {
                        data = chunk;
                    } else {
                        data += chunk;
                    }
                })
                res2.on("end", function () {
                    var ans1 = JSON.parse(data);
                    var temp1 = ans1.result;
                    for (var i = 0; i < temp1.length; i++) {
                        if (temp1[i].verdict == "OK") {
                            var x = user_arr.indexOf(temp1[i].problem.name)
                            if (x == -1) {
                                user_arr.push(temp1[i].problem.name)
                            }
                        }
                    }

                    // console.log(user_arr);
                    // console.log(rat);
                    // console.log(user_arr.length);
                    https.get(url, function (response) {

                        data = "";

                        response.on("data", function (chunk) {
                            if (!data) {
                                data = chunk;
                            }
                            else {
                                data += chunk;
                            }
                        })
                        response.on("end", function () {
                            var ans = JSON.parse(data);
                            var temp = ans.result.problems;
                            var arr = [];
                            var rem = rat % 100;
                            var vrat = rat;
                            if (rem == 0) {
                                vrat += 100;
                            }
                            else {
                                vrat -= rem;
                                vrat += 100;
                            }
                            //console.log(vrat);
                            //console.log(temp);
                            var cnt = 0;
                            for (var i = 0; i < temp.length && cnt < 10; i++) {
                                var x = user_arr.indexOf(temp[i].name)
                                if (temp[i].rating == vrat && x == -1) {
                                    // console.log(temp[i]);
                                    arr.push(temp[i]);
                                    cnt++;
                                }
                                //arr.push(temp[i]);
                            }
                            //console.log(temp.length);
                            console.log(arr);
                            console.log(arr.length);
                            console.log(rat);
                            console.log(user_arr.length);
                            res.write("User rating" + rat);
                            res.send();
                        })

                    })
                })

            })
        })
    })


})










app.listen(5000, function (req, res) {
    console.log("Server is runnung at port 5000")
})