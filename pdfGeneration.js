const loadData = require('./loadData.js');
async function getActivityList(conn, semester_no){
    const courseActivityQuery = `select distinct A.activity_name, A.id, eca.sector_or_program from Evaluates_Course_Activity as eca join Activity_Type A on eca.activity_type_id = A.id where eca.semester_no = ${semester_no}`;
    const semesterActivityQuery = `select distinct A.activity_name, A.id, psa.sector_or_program from Processes_Semester_Activity as psa join Activity_Type A on psa.activity_type_id = A.id where psa.semester_no = ${semester_no}`;
    try{
        const activities = {};
        activities["courseActivities"] = await loadData(conn, undefined, undefined, courseActivityQuery);
        activities["semesterActivities"] = await loadData(conn, undefined, undefined, semesterActivityQuery);
        return activities;
    }
    catch(err){
        console.log(err);
    }
}

async function getCourseActivityTable(conn, activity_type_id, sector_or_program, semester_no){

    // finding the factor at first by running a query
    const factors = await getFactors(conn, activity_type_id, sector_or_program, semester_no, "Evaluates_Course_Activity"); 
    // Generate the dynamic query based on the factors
    //
    let groupString = "";
    factors.map((factor) => {
        groupString += `SUM(CASE WHEN factor = '${factor}' THEN quantity ELSE 0 END) AS "${factor}", `
    })
    groupString = groupString.slice(0, groupString.length - 2);
    const query = 
        `SELECT course_id as 'Course no', c.title 'Course title', ${groupString}, E.evaluator_name as 'Name', E.designation as 'Designation', concat(E.dept_name, ', ', E.university_name) as "Address" FROM Evaluates_Course_Activity eca join Evaluator E on eca.evaluator_id = E.evaluator_id join Course c on eca.course_id = c.id WHERE semester_no = ${semester_no} and sector_or_program like "%${sector_or_program}%" and activity_type_id=${activity_type_id} GROUP BY activity_type_id, sector_or_program, E.evaluator_name, course_id, semester_no order by course_id;`;

    let tableData = await loadData(conn, undefined, undefined, query);
    return tableData;
}


async function getSemesterActivityTable(conn, activity_type_id, sector_or_program, semester_no){

    // finding the factor at first by running a query
    const factors = await getFactors(conn, activity_type_id, sector_or_program, semester_no, "Processes_Semester_Activity"); 
    // Generate the dynamic query based on the factors
    //
    let groupString = "";
    factors.map((factor) => {
        groupString += `SUM(CASE WHEN factor = '${factor}' THEN quantity ELSE 0 END) AS "${factor}", `
    })
    groupString = groupString.slice(0, groupString.length - 2);
    const query = 
        `SELECT E.evaluator_name as 'Name', E.designation as 'Designation', concat(E.dept_name, ', ', E.university_name) as "Address", ${groupString}  FROM Processes_Semester_Activity psa join Evaluator E on psa.evaluator_id = E.evaluator_id  WHERE semester_no = ${semester_no} and sector_or_program like "%${sector_or_program}%" and activity_type_id=${activity_type_id} GROUP BY activity_type_id, sector_or_program, E.evaluator_name, semester_no`;

    let tableData = await loadData(conn, undefined, undefined, query);
    return tableData;
}

async function getFactors(conn, activity_type_id, sector_or_program, semester_no, tableName){

    const query = ` select distinct factor from ${tableName} eca where activity_type_id = ${activity_type_id} and sector_or_program like '%${sector_or_program}%' and semester_no = ${semester_no}`;
    try{
        let factors;
        factors = await loadData(conn, undefined, undefined, query);
        const factorArr = factors.map((factor) => factor.factor);
        return factorArr;
    }
    catch(err){
        console.log(err);
    }
}
module.exports = {getActivityList, getCourseActivityTable, getSemesterActivityTable};
