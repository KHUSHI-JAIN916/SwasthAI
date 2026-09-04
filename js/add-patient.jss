/* =================================
   ADD PATIENT
================================= */


const addPatientForm =
    document.getElementById(
        "addPatientForm"
    );


if (addPatientForm) {

    addPatientForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const patientName =
                document
                    .getElementById(
                        "patientName"
                    )
                    .value
                    .trim();


            const patientAge =
                document
                    .getElementById(
                        "patientAge"
                    )
                    .value;


            const patientGender =
                document
                    .getElementById(
                        "patientGender"
                    )
                    .value;


            const patientPhone =
                document
                    .getElementById(
                        "patientPhone"
                    )
                    .value
                    .trim();


            const patientAddress =
                document
                    .getElementById(
                        "patientAddress"
                    )
                    .value
                    .trim();


            /* CREATE PATIENT OBJECT */

            const patient = {

                id:
                    "AYU-" +
                    Date.now(),


                name:
                    patientName,


                age:
                    patientAge,


                gender:
                    patientGender,


                phone:
                    patientPhone,


                address:
                    patientAddress,


                createdAt:
                    new Date()
                        .toLocaleDateString()


            };


            /* SAVE PATIENT */

            addPatient(
                patient
            );


            alert(
                "Patient added successfully!"
            );


            /* REDIRECT */

            window.location.href =
                "patients.html";

        }
    );

}