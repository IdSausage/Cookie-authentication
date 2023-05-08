const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const port = 3000;
const app = express();
const valid = false;

const connection = mysql.createConnection({
	host: "server2.bsthun.com",
	port: "6105",
	user: "lab_1fidap",
	password: "gLlbejIK8cS65Gio",
	database: "lab_todo02_1f5xtvn",
});

connection.connect(() => {
	console.log("Database is connected");
});

app.use(bodyParser.json({ type: "application/json" }));

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/basic/login", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	var sql = mysql.format(
		"SELECT * FROM users WHERE username = ? AND password = ?",
		[username, password]
	);
	console.log("DEBUG: /basic/login => " + sql);
	connection.query(sql, (err, rows) => {

		const encrypt = async() => {	
			valid = await bcrypt.compare(password ,rows[0].hash_password);
			if(valid){
				res.send("password is correct");
			}
		}
		encrypt();

		if (err) {
			return res.json({
				success: false,
				data: null,
				error: err.message,
			});
		}

		numRows = rows.length;
		if (numRows == 0) {
			res.json({
				success: false,
				message: "Login credential is incorrect",
			});
		} else {
			res.json({
				success: true,
				message: "Login credential is correct",
				user: rows[0],
			});
		}
	});
});

app.post("/register" , (req,res) => {
	const username = req.body.username;
	const password = req.body.password;

	const checkPasswordlength = RegExp('.{8,}').test(password);
	const checkPasswordCase = RegExp('(?=.*[a-z])(?=.*[A-Z]).+').test(password);

	if(!checkPasswordCase && !checkPasswordlength && !password){
		return res.send("the given password does not match with the policy");
	}

	const hash_password = "";

	const encryption = async() => {
		const salt1 = await bcrypt.genSalt(10);
		hash_password = await bcrypt.hash(password , salt1);
	}
	encryption();
	var sql = mysql.format("INSERT INTO users (password,hashed_password) VALUES (? ,?)" ,[password,hash_password]);

	connection.query(sql , (err,rows) => {
		if(err){
			res.send({
				success:false,
				message: "register failed.",
				data:null
			});
		}
		else{
			res.send({
				success:true,
				message: "register successfully.",
				data:rows[0]
			})
		}
	})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});