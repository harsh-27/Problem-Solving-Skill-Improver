
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());




const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/lsampleDB", { useNewUrlParser: true });


const sampleSchema = new mongoose.Schema({
    userName: String,
    password: String,
    handle: String,
    todoList: [String],
    rejList: [String]
});

const Lsample = mongoose.model("Lsample", sampleSchema);

// const lsample = new Lsample({
//     userName: "harsh",
//     password: "abcdef",
//     handle: "harsh_27",
//     todoList: []
// });


// const rate = new Rate({
//     handle: "harsh_27"
// });


//rate.save();

//const members = httpcodeforces.com/api/contest.list?gym=true;
// app.post("/rating", function (req, res) {
//     console.log(req.body);
//     res.send("Hello");
// })




function calculation(handle, res) {
    var rat;
    var arr = [];
    const url = "https://codeforces.com/api/problemset.problems";
    const urlrat = "https://codeforces.com/api/user.info?handles=" + handle;
    const usersum = "https://codeforces.com/api/user.status?handle=" + handle;

    var data;
    //console.log(response.statusCode)

    var user_arr = [];
    https.get(urlrat, function (res1) {
        res1.on("data", function (data) {
            rat = (JSON.parse(data)).result[0].rating;
            //console.log(rat);
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

                    //console.log(user_arr);
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
                            arr = [];
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
                            if (arr.length != 0) {
                                let obj = {
                                    rating: rat,
                                    ques: arr
                                };
                                res.json(obj);
                            }
                            else {
                                if (rat > 0) {
                                    arr = [];
                                    var cnt = 0;
                                    for (var i = 0; i < temp.length && cnt < 10; i++) {
                                        var x = user_arr.indexOf(temp[i].name)
                                        if (x == -1) {
                                            // console.log(temp[i]);
                                            arr.push(temp[i]);
                                            cnt++;
                                        }
                                        //arr.push(temp[i]);
                                    }
                                    let obj = {
                                        rating: rat,
                                        ques: arr
                                    };
                                    res.json(obj);
                                }
                                else {
                                    let obj = {
                                        rating: 0,
                                        ques: []
                                    };
                                    res.json(obj);
                                }

                            }
                            res.send();
                        })

                    })
                })

            })
        })
    })
}

app.post("/list", function (req, res) {
    console.log(req.body);
    res.send(req.body);
})

app.post("/nrating", function (req, res) {
    const handle = req.body.handle;
    const userName = req.body.userName;
    const password = req.body.password;
    console.log(req.body);

    Lsample.find(function (err, lsamples) {
        if (err) console.log(err);
        else {
            var x = 0;
            lsamples.forEach(function (lsample) {
                if (handle == lsample.handle) {
                    x = 1;
                }
            });
            if (x) {
                calculation(handle, res);

            }
            else {


                const urlrat = "https://codeforces.com/api/user.info?handles=" + handle;
                https.get(urlrat, function (res1) {
                    res1.on("data", function (data) {
                        var check = (JSON.parse(data)).status;
                        console.log(check);
                        if (check == "FAILED") {
                            console.log("Invalid Handle");
                            let obj = {
                                rating: -1,
                                ques: []
                            };
                            res.json(obj);
                            res.send();
                        } else {
                            const lsample = new Lsample({
                                userName: userName,
                                password: password,
                                handle: handle,
                                todoList: [],
                                rejList: []
                            });
                            lsample.save();
                            calculation(handle, res);
                        }
                    })
                })

            }
        }
    });


})

// app.get("/nrating", function (req, res) {

//     res.write("User Rating " + rat);
//     res.send();

//     //res.send("Server is UP and running");

// })


app.listen(5000, function (req, res) {
    console.log("Server is runnung at port 5000")
})