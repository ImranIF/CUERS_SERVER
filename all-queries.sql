# General query
# let query =
WITH acFactor AS
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
SELECT distinct eca.course_id as 'Course no',
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
       FROM ${tableName} eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and eca.sector_or_program like '${sector_or_program}' and eca.activity_type_id=${activity_type_id}
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;


# if (activity_type_id === 3 || activity_type_id === 6 || (activity_type_id >= 8 && activity_type_id <= 15)) {
#                 tableName = "Processes_Semester_Activity";
# let query =
WITH acFactor AS
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
group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;



# Example:
# WITH acFactor AS
# (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id = 4
# AND ac.sector_or_program LIKE 'অনার্স%' ),
# ecaQuantity AS ( SELECT DISTINCT quantity FROM Evaluates_Course_Activity eca
# WHERE eca.activity_type_id = 4 AND eca.semester_no =8
# AND eca.evaluator_id = 1010 AND eca.sector_or_program = 'অনার্স'
# AND eca.factor = (SELECT factor from acFactor) ),
#  billCheck AS (
#     Select
#     CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000 || ac.factor = 'ঘণ্টা')
#     THEN bill * eca.quantity ELSE bill END AS real_bill FROM Activity ac INNER JOIN Evaluates_Course_Activity eca on eca.evaluator_id = 1010
#     AND eca.semester_no =  8
#     AND eca.activity_type_id = 4
#     AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = 'অনার্স'
#     AND ac.sector_or_program LIKE 'অনার্স%' AND eca.factor = 'ছাত্রের সংখ্যা'
#     AND ac.factor = (SELECT factor from acFactor)
#     AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)
# SELECT distinct eca.course_id as 'Course no',
#     sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
#     sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
#     sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
#     sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
#     (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
#        FROM Evaluates_Course_Activity eca where eca.evaluator_id=1010 and semester_no = 8 and eca.sector_or_program like 'অনার্স' and eca.activity_type_id=4
# group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;


#Example 2:
# WITH acFactor AS
# (SELECT DISTINCT factor FROM Activity ac WHERE ac.activity_type_id =8
# AND ac.sector_or_program LIKE 'অনার্স%' ),
# ecaQuantity AS ( SELECT DISTINCT quantity FROM Processes_Semester_Activity eca
# WHERE eca.activity_type_id = 8 AND eca.semester_no =8
# AND eca.evaluator_id = 1010 AND eca.sector_or_program = 'অনার্স'
# AND eca.factor = (SELECT factor from acFactor) ),
#  billCheck AS (
#     Select
#     CASE WHEN (ac.quantity_final - ac.quantity_initial >= 10000 || ac.factor = 'ছাত্রের সংখ্যা')
#     THEN bill * eca.quantity ELSE bill END AS real_bill FROM Activity ac INNER JOIN Processes_Semester_Activity eca on eca.evaluator_id = 1010
#     AND eca.semester_no =  8
#     AND eca.activity_type_id = 8
#     AND eca.activity_type_id = ac.activity_type_id AND eca.sector_or_program = 'অনার্স'
#     AND ac.sector_or_program LIKE 'অনার্স%' AND eca.factor = 'ছাত্রের সংখ্যা'
#     AND ac.factor = (SELECT factor from acFactor)
#     AND (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)
# SELECT distinct
#     sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
#     sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
#     sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
#     sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
#     (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
#        FROM Processes_Semester_Activity eca where eca.evaluator_id=1010 and semester_no = 8 and eca.sector_or_program like 'অনার্স' and eca.activity_type_id=8
# group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;



WITH acFactor AS
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
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;


#Example:
# WITH acFactor AS
#     (SELECT DISTINCT factor
#      FROM Activity ac
#      WHERE ac.activity_type_id = 1 AND
#            ac.sector_or_program LIKE 'ব্যবহারিক%' )
#    , ecaQuantity AS
#        ( SELECT DISTINCT quantity
#          FROM Evaluates_Course_Activity eca
#          WHERE eca.activity_type_id = 1 AND
#                eca.semester_no = 8 AND
#                eca.evaluator_id = 1013 AND
#                eca.sector_or_program = 'ব্যবহারিক' AND
#                eca.factor = (SELECT factor from acFactor)
#          ),
#     billCheck AS (
# SELECT DISTINCT CASE
#     WHEN ac.quantity_final - ac.quantity_initial >= 1000000 THEN GREATEST(min_bill * 0.4, bill * quantity * 0.4) ELSE GREATEST(min_bill * 0.4, bill * 0.4) END AS real_bill
# FROM Activity ac INNER JOIN Evaluates_Course_Activity eca
#     on eca.evaluator_id = 1013 AND
#        eca.semester_no =  8 AND
#        eca.activity_type_id = 1 AND
#        eca.activity_type_id = ac.activity_type_id AND
#        eca.sector_or_program = 'ব্যবহারিক' AND
#        ac.sector_or_program LIKE 'ব্যবহারিক%' AND
#        eca.factor = 'পরীক্ষার সংখ্যা' AND
#        ac.factor = (SELECT factor from acFactor) AND
#        (SELECT quantity from ecaQuantity) BETWEEN ac.quantity_initial AND ac.quantity_final)
#
# SELECT distinct eca.course_id as 'Course no',
#     sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
#     sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
#     sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
#     sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
#     (select real_bill FROM billCheck) AS 'টাকার পরিমাণ'
#        FROM Evaluates_Course_Activity eca where eca.evaluator_id=1013 and semester_no = 8 and eca.sector_or_program like 'ব্যবহারিক' and eca.activity_type_id=1
# group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;


#if(activity_type_id == 3)
# query =
WITH cntMembers AS (
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
group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;


# Example:
# WITH cntMembers AS (
#     SELECT COUNT(*) AS count
#     FROM Exam_Committee ec
#     WHERE ec.semester_no = 3 AND
#     ec.program = 'অনার্স'
# ), billSum AS(
# SELECT (SUM(bill) / (SELECT count from cntMembers) ) as real_bill FROM Activity ac INNER JOIN Course_in_Semester_Exam cise
# ON cise.semester_no = 3 AND cise.program = 'অনার্স' AND
# ac.factor = 'ঘণ্টা' AND ac.activity_type_id = 1 AND
# cise.hours = (ac.quantity_initial + ac.quantity_final) / 2)
# SELECT distinct
#     sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
#     sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
#     sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
#     sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
#     (select real_bill FROM billSum) AS 'টাকার পরিমাণ'
#        FROM
#            Processes_Semester_Activity eca WHERE eca.evaluator_id=1003 and semester_no = 3 and sector_or_program like 'সব খাতসমূহ' and activity_type_id=3
# group by eca.sector_or_program, eca.evaluator_id, eca.semester_no;


#if(activity_type_id == 5)
# query =
with daysCheck as (select distinct quantity from Evaluates_Course_Activity eca
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
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;


# Example:
# with daysCheck as (select distinct quantity from Evaluates_Course_Activity eca
#             where activity_type_id = 5 and eca.factor = 'দিন' ),
#      hoursCheck as (select distinct quantity from Evaluates_Course_Activity eca
#              where activity_type_id = 5 and evaluator_id= 1013 and eca.factor = 'ঘণ্টা'),
#     billCheck as (SELECT case when
#     (select  quantity from hoursCheck hc where quantity >= 3 and quantity <= 4) then
#     ( Case when
#         ((select quantity from hoursCheck) * (select quantity from daysCheck) <= 26) then
#         ((select quantity from hoursCheck) * (select quantity from daysCheck) *250)
#         else 6500 END)
#     else( Case when
#         (select  quantity from hoursCheck where quantity >= 6 and quantity <= 8) then
#         ( Case when ((select quantity from hoursCheck) * (select quantity from daysCheck) <= 38) then
#             ((select quantity from hoursCheck) * (select quantity from daysCheck)) *250
#             else 9500 end)
#         else 0 END)
#     END AS ac_bill from hoursCheck inner join daysCheck)
# SELECT distinct eca.course_id as 'Course no',
#     sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
#     sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
#     sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
#     sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
#     (select ac_bill FROM billCheck) AS 'টাকার পরিমাণ'
#        FROM Evaluates_Course_Activity eca where eca.evaluator_id=1013 and semester_no = 8 and sector_or_program like 'ব্যবহারিক' and activity_type_id=5
# group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;











#Alternative to activity_type_id == 5)
with daysCheck as (select distinct quantity from Evaluates_Course_Activity eca
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
    END AS ac_bill from hoursCheck inner join daysCheck),
    courseCheck AS (
        SELECT DISTINCT course_id FROM Evaluates_Course_Activity eca
        WHERE eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and sector_or_program like 'ব্যবহারিক' and activity_type_id=5
    )
SELECT distinct (SELECT GROUP_CONCAT(DISTINCT course_id, ', ') FROM courseCheck),
    sum(CASE WHEN factor like 'ছাত্রের সংখ্যা' or factor like 'পৃষ্ঠার সংখ্যা' THEN quantity ELSE 0 END) AS "খাতা/ছাত্রের সংখ্যা/পৃষ্ঠার সংখ্যা",
    sum(CASE WHEN factor like 'ঘণ্টা' THEN quantity ELSE 0 END) AS "কত ঘণ্টার পরীক্ষা",
    sum(CASE WHEN factor like 'দিন' or factor like 'সদস্য সংখ্যা' or factor like 'পরীক্ষার সংখ্যা' THEN quantity ELSE 0 END) AS "মোট দিন/সদস্য সংখ্যা/পরীক্ষার সংখ্যা",
    sum(CASE WHEN factor like 'অর্ধ/পূর্ণ' THEN quantity ELSE 0 END) AS "অর্ধ/পূর্ণ পত্র",
    (select ac_bill FROM billCheck) AS 'টাকার পরিমাণ'
       FROM Evaluates_Course_Activity eca where eca.evaluator_id=${evaluator_id} and semester_no = ${semester_no} and sector_or_program like 'ব্যবহারিক' and activity_type_id=5
group by eca.course_id, eca.sector_or_program, eca.evaluator_id, eca.semester_no;