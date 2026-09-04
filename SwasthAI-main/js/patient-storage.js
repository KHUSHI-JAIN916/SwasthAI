/* =================================
   SWASTHAI Patient Storage
================================= */


/* GET ALL PATIENTS */

function getPatients() {

    return JSON.parse(
        localStorage.getItem(
            "ayushPatients"
        )
    ) || [];

}


/* SAVE ALL PATIENTS */

function savePatients(patients) {

    localStorage.setItem(
        "ayushPatients",
        JSON.stringify(
            patients
        )
    );

}


/* ADD NEW PATIENT */

function addPatient(patient) {

    const patients =
        getPatients();


    patients.push(
        patient
    );


    savePatients(
        patients
    );

}


/* FIND PATIENT */

function getPatientById(patientId) {

    const patients =
        getPatients();


    return patients.find(
        patient =>
            patient.id === patientId
    );

}


/* DELETE PATIENT */

function deletePatient(patientId) {

    let patients =
        getPatients();


    patients =
        patients.filter(
            patient =>
                patient.id !== patientId
        );


    savePatients(
        patients
    );

}