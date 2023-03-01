const { Router } = require("express"); //import Router class
// const db = require('../database')
const router = Router();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
router.use(cors());
// const app = express();

const mariadb = require("mysql"); //import mariadb
router.use(bodyParser.json());
const conn = mariadb.createConnection({
    //allow us to import this file with database connection
    host: "h1p.h.filess.io",
    port: "3305",
    user: "CUERS_realenter",
    password: "f031ad57d5d061a2c1003b21f5d9af7771fbfcce",
    database: "CUERS_realenter",
});

router.use((req, res, next) => {
    console.log("Request made to /USERS Route");
    next(); //needs to go to the middleware
});

router.get("/posts", (req, res) => {
    res.json({ route: "Posts" });
});

// Loading for the first time is not working {}
router.post("/loadTableInfo", (req, res) => {
    const { tableNames } = req.body;
    let tableInfo = {};
    let tableDesc = {};
    const promises = tableNames.map((tableName) => {
        return new Promise((resolve, reject) => {
            const query = `desc ${tableName}`;
            conn.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    tableDesc[tableName] = results;
                    resolve();
                }
            });
        });
    });
    Promise.all(promises)
        .then(() => {
            // getting the primary keys of each
            const tableInfo = {};
            for (table in tableDesc) {
                const tempInfo = {};
                let primaryKeys = [];
                let dataTypes = {};
                primaryKeys = tableDesc[table]
                    .filter((item) => item.Key === "PRI")
                    .map((item) => item.Field);
                tempInfo["primaryKeys"] = primaryKeys;
                // getting the types;
                dataTypes = tableDesc[table].reduce((result, { Field, Type }) => {
                    result[Field] = Type;
                    // console.log("The result is:", result);
                    return result;
                }, {});
                tempInfo["dataTypes"] = dataTypes;
                tableInfo[table] = tempInfo;
            }
            res.json(tableInfo);
        })
        .catch((err) => {
            console.error("Error getting table desc: ", err);
            res.status(500).send("Internal server Error");
        });
});

async function loadData(tableName, conditionCheck) {
    return new Promise((resolve, reject) => {
        // const query = `SELECT * FROM ${tableName}`;
        //console.log("colName is:", colName);
        let query = "";
        // console.log("conditionCheck is:", conditionCheck)
        if (conditionCheck) {
            // console.log("colName is:", conditionCheck)
            query = `SELECT * FROM ${tableName} WHERE ${conditionCheck};`;
            console.log("query is:", query);
        }
        else {
            query = `SELECT * FROM ${tableName}`;
            console.log("query is:", query);
        }

        conn.query(query, function (err, result) {
            if (err) return reject(err);
            const data = Object.values(JSON.parse(JSON.stringify(result)));
            resolve(data);
        });
    });
}

async function deleteData(tableName, row, getTableInfo) {
    return new Promise((resolve, reject) => {
        const { primaryKeys, dataTypes } = getTableInfo[tableName];

        // creating the query
        let pkLen = primaryKeys.length;
        console.log("PK LEN IS:", pkLen);
        console.log(row[primaryKeys[0]]);
        let pkValueString = "";

        // dataTypes[row[primaryKeys[i]] === "int(11)"
        for (let i = 0; i < pkLen; i++) {
            if (dataTypes[primaryKeys[i]].localeCompare("int(11)") == 0) {
                pkValueString += `${primaryKeys[i]} = ${row[primaryKeys[i]]}`;
            } else {
                pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
            }
            if (pkLen - 1 != i) pkValueString += " and ";
        }

        // running the query
        const query = `DELETE FROM ${tableName} WHERE ${pkValueString};`;
        conn.query(query, function (err, result) {
            if (err) return reject(err);
            const data = Object.values(JSON.parse(JSON.stringify(result)));
            resolve(data);
        });
    });
}
async function updateData(tableName, row, updatedData, getTableInfo) {
    return new Promise((resolve, reject) => {
        const { primaryKeys, dataTypes } = getTableInfo[tableName];
        const { colType, value } = updatedData;

        // create the query
        let pkLen = primaryKeys.length;
        console.log("PK LEN IS:", pkLen);
        console.log(row[primaryKeys[0]]);
        let pkValueString = "";
        for (let i = 0; i < pkLen; i++) {
            if (dataTypes[primaryKeys[i]].localeCompare("int(11)") == 0)
                pkValueString += `${primaryKeys[i]} = ${row[primaryKeys[i]]}`;
            else
                pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
            if (pkLen - 1 != i) pkValueString += " and ";
        }
        let val = "";
        if (dataTypes[colType].localeCompare("int(11)") == 0) {
            val += `${colType} = ${value}`;
        } else {
            val += `${colType} =  '${value}'`;
        }
        const query = `UPDATE ${tableName} SET ${val} WHERE ${pkValueString};`;

        // run the query
        conn.query(query, function (err, result) {
            if (err) return reject(err);
            const data = Object.values(JSON.parse(JSON.stringify(result)));
            resolve(data);
        });
    });
}

async function insertData(tableName, row, getTableInfo) {
    return new Promise((resolve, reject) => {
        // create the query
        const { dataTypes } = getTableInfo[tableName];
        console.log("Get Table INFO: ", getTableInfo[tableName])
        console.log("ROWS: ", row)
        let fields = "";
        let val = "";
        for (let key in row) {
            if (row.hasOwnProperty(key)) {
                fields += `\`${key}\`, `;
                if (dataTypes[key].localeCompare("int(11)") == 0) {
                    val += `${row[key]}, `;
                } else {
                    val += `"${row[key]}", `;
                }
            }
        }
        fields = fields.slice(0, fields.length - 2);
        val = val.slice(0, val.length - 2);
        const query = `INSERT INTO ${tableName} (${fields}) VALUES (${val});`;

        console.log("Insertion", query);
        // run the query
        conn.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const data = Object.values(JSON.parse(JSON.stringify(result)));
                resolve(data);
            }
        });
    });
}

async function dropdownData(dropdownChanges) {
    const { tableName, operation, colName } = dropdownChanges;
    if (operation === "load") {
        try {
            let data = [];
            if (colName) {
                data = await loadData(tableName, colName);
                console.log("Loaded data: ", data);
            }
        } catch (err) {
            console.error(err);
            throw new Error("Error loading data");
        }
    }
}

async function processData(changes, getTableInfo) {
    console.log("passed tableInfo: ", getTableInfo);
    const { tableName, row, operation, updatedData, conditionCheck } = changes;
    if (operation === "load") {
        let data;
        try {
            if (conditionCheck) {
                console.log("Condition Check: ", conditionCheck);
                data = await loadData(tableName, conditionCheck);
            }
            else {
                data = await loadData(tableName);

            }

            // console.log("Loaded data: ", data);
            return data;
        } catch (err) {
            console.error(err);
            throw new Error("Error loading data");
        }

    } else if (operation === "insert") {
        try {
            const data = await insertData(tableName, row, getTableInfo);
            console.log("Insertion status: ", data);
            return { msg: "Added a new row" };
        } catch (err) {
            console.error(err);
            throw new Error("Error inserting data");
        }
    } else if (operation === "delete") {
        try {
            const data = await deleteData(tableName, row, getTableInfo);
            console.log("Deletion status: ", data);
            return { msg: "Deleted a row" };
        } catch (err) {
            console.error(err);
            throw new Error("Error deleting data");
        }
    } else if (operation === "update") {
        try {
            const data = await updateData(tableName, row, updatedData, getTableInfo);
            console.log("Update status: ", data);
            return { msg: "Updated a row" };
        } catch (err) {
            console.error(err);
            throw new Error("Error updating data");
        }
    }
}

// router.post("/dropdownData", (req, res) => {
//     const { dropdownChanges } = req.body;
//     dropdownChanges(dropdownChanges).then((data) => {
//         console.log(data);
//         res.json(data);
//         res.end();
//     });
// });


router.post("/processData", (req, res) => {
    const { changes, getTableInfo } = req.body;
    processData(changes, getTableInfo).then((data) => {
        //    console.log(data);
        res.json(data);
        res.end();
    });
});

router.post("/authenticatelogin", (req, res) => {
    const { evaluator_id, password, role } = req.body;
    console.log(evaluator_id, password, role);
    if (evaluator_id && password) {
        const query = `
        select * from Login_Info
        where evaluator_id = "${evaluator_id}"
        `;
        conn.query(query, function (error, data) {
            if (data?.length > 0) {
                for (var count = 0; count < data.length; count++) {
                    if (
                        data[count].password == password &&
                        data[count].role.localeCompare(role) == 0
                    ) {
                        res.status(200);
                        return res.json({ msg: "Correct Password" });
                    } else if (data[count].password == password) {
                        return res.json({ msg: "Incorrect Role" });
                    } else {
                        return res.json({ msg: "Incorrect Password" });
                    }
                }
            } else {
                return res.json({ msg: "Incorrect Evaluator Id" });
            }
            res.end();
        });
    }
});


router.post("/activityBillData", (req, res) => {
    const { Bill } = req.body;
    console.log("Bill: ", Bill);
    const tableInfo = {};
    const tableDesc = {};


    const promises = Bill.map(({ evaluator_id, semester_no, front, factor, sector_or_program, activity_type_id }) => {
        // console.log("evaluator_id", evaluator_id);
        // console.log("semester_no", semester_no);
        // console.log("front", front);
        // console.log("factor", factor);
        // console.log("sector_or_program", sector_or_program);
        // console.log("activity_type_id", activity_type_id);

        return new Promise((resolve, reject) => {
            // let query = "select * from Activity where activity_type_id = 10 and sector_or_program like 'CSE%'";
            console.log(activity_type_id);
            let tableName = "Evaluates_Course_Activity";
            if (activity_type_id === 3 || activity_type_id === 6 || (activity_type_id >= 8 && activity_type_id <= 15)) {
                tableName = "Processes_Semester_Activity";
            }

            let query = `WITH acFactor AS (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = ${activity_type_id} AND ac.sector_or_program LIKE '${sector_or_program}%' ), ecaQuantity AS ( SELECT DISTINCT quantity FROM ${tableName} eca WHERE eca.activity_type_id = ${activity_type_id} AND eca.semester_no = ${semester_no} AND eca.evaluator_id = ${evaluator_id} AND eca.sector_or_program = '${sector_or_program}' AND eca.factor = (SELECT factor from acFactor) ) Select DISTINCT * , CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000 || ac.factor = '${factor}') THEN bill * quantity ELSE bill END AS real_bill FROM Activity ac INNER JOIN ${tableName} eca on eca.evaluator_id = ${evaluator_id} AND eca.semester_no =  ${semester_no} AND eca.activity_type_id = ${activity_type_id} AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = '${sector_or_program}' AND ac.sector_or_program LIKE '${sector_or_program}%' AND eca.factor = '${factor}' AND ac.factor = (SELECT factor from acFactor) AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final;`
            if(activity_type_id ===3 ){
                query = `WITH cntMembers AS ( SELECT COUNT(*) AS count FROM Exam_Committee ec WHERE ec.semester_no = ${semester_no} AND ec.program = 'Honours' ) SELECT SUM(bill) / (SELECT count from cntMembers) FROM Activity ac INNER JOIN Course_in_Semester_Exam cise ON cise.semester_no = ${semester_no} AND cise.program = '${sector_or_program}' AND ac.factor = '${factor}' AND ac.activity_type_id = 3 AND cise.hours = (ac.quantity_initial + ac.quantity_final) / 2;`
            }
            if(activity_type_id===2){
                query = `WITH acFactor AS (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = 1 AND ac.sector_or_program LIKE '${sector_or_program}%' ), ecaQuantity AS ( SELECT DISTINCT quantity FROM ${tableName} eca WHERE eca.activity_type_id = 1 AND eca.semester_no = ${semester_no} AND eca.evaluator_id = ${evaluator_id} AND eca.sector_or_program = '${sector_or_program}' AND eca.factor = (SELECT factor from acFactor) ) SELECT DISTINCT *, CASE WHEN ac.quantity_final - ac.quantity_initial >= 1000000 THEN GREATEST(min_bill * 0.4, bill * quantity * 0.4) ELSE GREATEST(min_bill * 0.4, bill * 0.4) END AS real_bill FROM Activity ac INNER JOIN ${tableName} eca on eca.evaluator_id = ${evaluator_id} AND eca.semester_no =  ${semester_no} AND eca.activity_type_id = 1 AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = '${sector_or_program}' AND ac.sector_or_program LIKE '${sector_or_program}%' AND eca.factor = '${factor}' AND ac.factor = (SELECT factor from acFactor) AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final;`;
            }
            if(activity_type_id===5){
                query =`WITH acFactor AS ( SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = 5 AND ac.sector_or_program LIKE 'Lab%' ), ecaQuantity AS ( SELECT DISTINCT quantity FROM Evaluates_Course_Activity eca WHERE eca.activity_type_id = 5 AND eca.semester_no = 8 AND eca.evaluator_id = 1003 AND eca.factor = (SELECT factor from acFactor) ) Select DISTINCT * FROM Activity ac INNER JOIN Evaluates_Course_Activity eca on eca.evaluator_id = 1003 AND eca.semester_no = 8 AND eca.activity_type_id = 5 AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = 'Lab' AND ac.sector_or_program LIKE 'Lab%' AND eca.factor = 'Days' AND ac.factor = (SELECT factor from acFactor) AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final;`

            }
            console.log("query:", query);


            conn.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    //tableDesc[tableName] = results;
                    console.log("results: ", results);
                    if (results == []) {
                        console.log(activity_type_id, sector_or_program, factor);
                    }
                    resolve();
                }
            });
        });
    });






    //     conn.query(query, function (err, result) {
    //         if (err) return reject(err);
    //         const data = Object.values(JSON.parse(JSON.stringify(result)));
    //         resolve(data);
    //     }

    //     // if (data != null) {
    //     //     answer.push(data);

    //     // }

    // }
});




router.get("/", (req, res) => {
    conn.query("SELECT * from Login_Info", function (err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        res.json({ rows });
        //   res.send(`Result: ${rows[0][]}`);
    });
});

module.exports = router;