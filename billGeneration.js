const loadData = require("./loadData.js");
async function getBill(conn, info) {
  const { Bill } = info;
  console.log("Bill: ", Bill);
  const tableInfo = {};
  const tableDesc = {};

  const activityThings = [];
  const promises = Bill.map(
    ({
      evaluator_id,
      semester_no,
      front,
      factor,
      sector_or_program,
      activity_type_id,
    }) => {
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
        let query = `WITH acFactor AS
(SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = ${activity_type_id}
AND ac.sector_or_program LIKE '${sector_or_program}%' ),
ecaQuantity AS ( SELECT DISTINCT quantity FROM ${tableName} eca
WHERE eca.activity_type_id = ${activity_type_id} AND eca.semester_no =${semester_no}
AND eca.evaluator_id = ${evaluator_id} AND eca.sector_or_program = '${sector_or_program}'
AND eca.factor = (SELECT factor from acFactor) ),
 billCheck AS (
    Select
    CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000 || ac.factor = (SELECT factor FROM acFactor))
    THEN bill * eca.quantity ELSE bill END AS real_bill FROM Activity ac INNER JOIN ${tableName} eca on eca.evaluator_id = ${evaluator_id}
    AND eca.semester_no =  ${semester_no}
    AND eca.activity_type_id = ${activity_type_id}
    AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = '${sector_or_program}'
    AND ac.sector_or_program LIKE '${sector_or_program}%' AND eca.factor like '${factor}'
    AND ac.factor = (SELECT factor from acFactor)
    AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)
SELECT distinct eca.course_id as 'Course no',
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
       FROM ${tableName} eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and eca.sector_or_program like '${sector_or_program}' and eca.activity_type_id=${activity_type_id}
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;`;
        if (
          activity_type_id === 6 ||
          (activity_type_id >= 8 && activity_type_id <= 15)
        ) {
          tableName = "Processes_Semester_Activity";
          query = `WITH acFactor AS
		  (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = ${activity_type_id}
		  AND ac.sector_or_program LIKE '${sector_or_program}%' ),
		  ecaQuantity AS ( SELECT DISTINCT quantity FROM ${tableName} eca
		  WHERE eca.activity_type_id = ${activity_type_id} AND eca.semester_no =${semester_no}
		  AND eca.evaluator_id = ${evaluator_id} AND eca.sector_or_program = '${sector_or_program}'
		  AND eca.factor = (SELECT factor from acFactor) ),
		   billCheck AS (
			  Select
			  CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000 || ac.factor = '${factor}')
			  THEN bill * eca.quantity ELSE bill END AS real_bill FROM Activity ac INNER JOIN ${tableName} eca on eca.evaluator_id = ${evaluator_id}
			  AND eca.semester_no =  ${semester_no}
			  AND eca.activity_type_id = ${activity_type_id}
			  AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = '${sector_or_program}'
			  AND ac.sector_or_program LIKE '${sector_or_program}%' AND eca.factor = '${factor}'
			  AND ac.factor = (SELECT factor from acFactor)
			  AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)
		  SELECT distinct
			  sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
			  sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
			  sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
			  sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
			  (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
				 FROM ${tableName} eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and eca.sector_or_program like '${sector_or_program}' and eca.activity_type_id=${activity_type_id}
		  group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;`;
        } else if (activity_type_id === 2) {
          query = `WITH acFactor AS
    (SELECT DISTINCT factor
     FROM Activity ac
     WHERE ac.activity_type_id = 1 AND
           ac.sector_or_program LIKE '${sector_or_program}%' )
   , ecaQuantity AS
       ( SELECT DISTINCT quantity
         FROM Evaluates_Course_Activity eca
         WHERE eca.activity_type_id = 1 AND
               eca.semester_no = ${semester_no} AND
               eca.evaluator_id = ${evaluator_id} AND
               eca.sector_or_program = '${sector_or_program}' AND
               eca.factor = (SELECT factor from acFactor)
         ),
    billCheck AS (
SELECT CASE
    WHEN ac.quantity_final - ac.quantity_initial >= 1000000 THEN GREATEST(min_bill * 0.4, bill * quantity * 0.4) ELSE GREATEST(min_bill * 0.4, bill * 0.4) END AS real_bill
FROM Activity ac INNER JOIN Evaluates_Course_Activity eca
    on eca.evaluator_id = ${evaluator_id} AND
       eca.semester_no =  ${semester_no} AND
       eca.activity_type_id = 1 AND
       eca.activity_type_id = ac.activity_type_id AND
       eca.sector_or_program = '${sector_or_program}' AND
       ac.sector_or_program LIKE '${sector_or_program}%' AND
       eca.factor = '${factor}' AND
       ac.factor = (SELECT factor from acFactor) AND
       (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)

SELECT distinct eca.course_id as 'Course no',
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
       FROM Evaluates_Course_Activity eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and eca.sector_or_program like '${sector_or_program}' and eca.activity_type_id=1
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;`;
        } 
        else if (activity_type_id === 3) {
          query = `WITH cntMembers AS (
    SELECT COUNT(*) AS count
    FROM Exam_Committee ec
    WHERE ec.semester_no = ${semester_no} AND
    ec.program = 'অনার্স'
), billSum AS(
SELECT (SUM(bill) / (SELECT count from cntMembers) ) as real_bill FROM Activity ac INNER JOIN Course_in_Semester_Exam cise
ON cise.semester_no = ${semester_no} AND cise.program = 'অনার্স' AND
ac.factor = 'ঘণ্টা' AND ac.activity_type_id = 1 AND
cise.hours = (ac.quantity_initial + ac.quantity_final) / 2)
SELECT distinct
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select real_bill FROM billSum) AS 'টাকার পরিমাণ'
       FROM
           Processes_Semester_Activity eca WHERE eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and sector_or_program like '${sector_or_program}' and activity_type_id=3
group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;`;
console.log(query)
        } 
        else if(activity_type_id === 4){
          query = `WITH acFactor AS 
          (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = ${activity_type_id}
          AND ac.sector_or_program LIKE '${sector_or_program}%' ),
          ecaQuantity AS ( SELECT DISTINCT quantity FROM Evaluates_Course_Activity eca
          WHERE eca.activity_type_id = ${activity_type_id} AND eca.semester_no =${semester_no}
          AND eca.evaluator_id = ${evaluator_id} AND eca.sector_or_program = '${sector_or_program}'
          AND eca.factor = (SELECT factor from acFactor) ),
              studentCheck AS (
                  SELECT distinct ECA.course_id as "Course no",
              sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS 'খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা',
              sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
              sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
              sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS 'অর্ধ/পূর্ণ পত্র'
                  FROM Evaluates_Course_Activity ECA where ECA.evaluator_id= ${evaluator_id} and ECA.semester_no = ${semester_no}  and ECA.sector_or_program like '${sector_or_program}' and ECA.activity_type_id=${activity_type_id}
          group by ECA.course_id, ECA.sector_or_program, ECA.evaluator_id, ECA.semester_no
                  ),
              calcCopyNoSNoP AS (
                SELECT sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS 'খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা'
                FROM Evaluates_Course_Activity ECA where ECA.evaluator_id= ${evaluator_id} and ECA.semester_no = ${semester_no}  and ECA.sector_or_program like '${sector_or_program}' and ECA.activity_type_id=${activity_type_id}
          group by ECA.course_id, ECA.sector_or_program, ECA.evaluator_id, ECA.semester_no
              ), calcDaysNoMNoE AS (
                SELECT sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা"
                FROM Evaluates_Course_Activity ECA where ECA.evaluator_id= ${evaluator_id} and ECA.semester_no = ${semester_no}  and ECA.sector_or_program like '${sector_or_program}' and ECA.activity_type_id=${activity_type_id}
          group by ECA.course_id, ECA.sector_or_program, ECA.evaluator_id, ECA.semester_no
              ), calcHalfFull AS (
                SELECT sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS 'অর্ধ/পূর্ণ পত্র'
                FROM Evaluates_Course_Activity ECA where ECA.evaluator_id= ${evaluator_id} and ECA.semester_no = ${semester_no}  and ECA.sector_or_program like '${sector_or_program}' and ECA.activity_type_id=${activity_type_id}
          group by ECA.course_id, ECA.sector_or_program, ECA.evaluator_id, ECA.semester_no
              ), calcHours AS (
                SELECT sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা"
                FROM Evaluates_Course_Activity ECA where ECA.evaluator_id= ${evaluator_id} and ECA.semester_no = ${semester_no}  and ECA.sector_or_program like '${sector_or_program}' and ECA.activity_type_id=${activity_type_id}
          group by ECA.course_id, ECA.sector_or_program, ECA.evaluator_id, ECA.semester_no
              ), 
           billCheck AS (
              Select bill,
              CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000  ) THEN bill
               * (CASE WHEN ((SELECT * from calcCopyNoSNop)>0 ) THEN (SELECT * from calcCopyNoSNop) ELSE 1 END)
                  * (CASE WHEN ((SELECT * from calcDaysNoMNoE)>0 ) THEN (SELECT * from calcDaysNoMNoE)  ELSE 1 END)
                  * (CASE WHEN ((SELECT * from calcHours)>0 ) THEN (SELECT * from calcHours) ELSE 1 END)
                  * (CASE WHEN ((SELECT * from calcHalfFull)>0 ) THEN (SELECT * from calcHalfFull) ELSE 1 END)
                  ELSE bill * (SELECT * from calcCopyNoSNop) END AS real_bill FROM Activity ac INNER JOIN Evaluates_Course_Activity eca on eca.evaluator_id = ${evaluator_id}
              AND eca.semester_no =  ${semester_no}
              AND eca.activity_type_id = ${activity_type_id}
              AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = '${sector_or_program}'
              AND ac.sector_or_program LIKE '${sector_or_program}%' AND eca.factor = '${factor}'
              AND ac.factor = (SELECT factor from acFactor)
              AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final )
                  SELECT studentCheck.*, (select real_bill FROM billCheck) AS 'টাকার পরিমাণ', (Select bill from billCheck) as 'Initial bill'
                  FROM studentCheck;`;
            // console.log(query)
        }
        
        else if (activity_type_id === 5) {
          query = `with daysCheck as (select distinct quantity from Evaluates_Course_Activity eca
            where activity_type_id = 5 and eca.factor = 'দিন' ),
     hoursCheck as (select distinct quantity from Evaluates_Course_Activity eca
             where activity_type_id = 5 and evaluator_id= ${evaluator_id} and eca.factor = 'ঘণ্টা'),
    billCheck as (SELECT case when
    (select  quantity from hoursCheck hc where quantity >= 3 and quantity <= 4) then
    ( Case when
        ((select quantity from hoursCheck) * (select quantity from daysCheck) <= 26) then
        ((select quantity from hoursCheck) * (select quantity from daysCheck) *250)
        else 6500 END)
    else( Case when
        (select  quantity from hoursCheck where quantity >= 6 and quantity <= 8) then
        ( Case when ((select quantity from hoursCheck) * (select quantity from daysCheck) <= 38) then
            ((select quantity from hoursCheck) * (select quantity from daysCheck)) *250
            else 9500 end)
        else 0 END)
    END AS ac_bill from hoursCheck inner join daysCheck)
SELECT distinct eca.course_id as 'Course no',
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select ac_bill FROM billCheck) AS 'টাকার পরিমাণ'
       FROM Evaluates_Course_Activity eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and sector_or_program like 'ব্যবহারিক' and activity_type_id=5
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;`;
        }
          // console.log("query:", query);

        conn.query(query, (err, results) => {
          if (err) {
            reject(err);
          } else {
            //tableDesc[tableName] = results;
            let obj = Object(results)[0];
            // console.log("results: ", Object(results)[0]);
            if (obj !== undefined) {
              obj = JSON.parse(JSON.stringify(obj));
              obj["activity_type_id"] = activity_type_id;
              obj["sector_or_program"] = sector_or_program;
                obj["front"] = front;
                if(obj["Course no"] === undefined){
                    obj["Course no"] = "";
                }
              activityThings.push(obj);
            }
            resolve();
          }
        });
      });
    }
  );
  return Promise.all(promises).then(() => {
    // console.log("Begula", activityThings);
    return activityThings;
  });
}

module.exports = { getBill };

