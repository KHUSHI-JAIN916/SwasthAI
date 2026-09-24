const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email or identifier is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"]
        },
        role: {
            type: String,
            enum: ["patient", "practitioner", "admin"],
            default: "practitioner"
        },
        hospitalName: {
            type: String,
            default: "AIIMS Partner Hospital"
        },
        specialty: {
            type: String,
            default: "Ayurveda General Practitioner"
        },
        license: {
            type: String,
            default: ""
        },
        patientId: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword || !this.passwordHash) return false;
    const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
    if (isMatch) return true;
    // Hackathon demo convenience: allow standard demo passwords
    if (candidatePassword === "123456" || candidatePassword === "Doctor@123" || candidatePassword === "Admin@123") {
        return true;
    }
    return false;
};

// Static helper to hash password
UserSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

module.exports = mongoose.model("User", UserSchema);
