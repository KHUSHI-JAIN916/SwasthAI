/* =================================
   SWASTHAI Authentication
================================= */


/* ================================
   DEFAULT DEMO USER
================================ */

const demoUser = {
    name: "Dr. Sharma",
    email: "doctor@ayush.com",
    password: "123456",
    role: "Doctor / Practitioner"
};


/* Save demo account if no users exist */

let users =
    JSON.parse(
        localStorage.getItem("ayushUsers")
    ) || [];


if (users.length === 0) {

    users.push(demoUser);

    localStorage.setItem(
        "ayushUsers",
        JSON.stringify(users)
    );
}



/* ================================
   SIGNUP
================================ */

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "signupName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const role =
                document
                    .getElementById(
                        "signupRole"
                    )
                    .value;


            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    .value;


            const message =
                document.getElementById(
                    "signupMessage"
                );


            /* Check existing user */

            const userExists =
                users.some(
                    user =>
                        user.email === email
                );


            if (userExists) {

                message.textContent =
                    "An account with this email already exists.";

                message.className =
                    "auth-message error";

                return;

            }


            /* Create new user */

            const newUser = {

                name,
                email,
                role,
                password

            };


            users.push(
                newUser
            );


            localStorage.setItem(
                "ayushUsers",
                JSON.stringify(users)
            );


            message.textContent =
                "Account created successfully! Redirecting...";


            message.className =
                "auth-message success";


            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                1200
            );

        }
    );

}



/* ================================
   LOGIN
================================ */

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            /* Find User */

            const user =
                users.find(
                    user =>
                        user.email === email &&
                        user.password === password
                );


            if (!user) {

                message.textContent =
                    "Invalid email or password.";

                message.className =
                    "auth-message error";

                return;

            }


            /* Save logged in user */

            localStorage.setItem(
                "ayushCurrentUser",
                JSON.stringify(user)
            );


            message.textContent =
                "Login successful! Redirecting...";


            message.className =
                "auth-message success";


            setTimeout(
                () => {

                    window.location.href =
                        "dashboard.html";

                },
                800
            );

        }
    );

}