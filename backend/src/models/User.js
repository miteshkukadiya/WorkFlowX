const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : [true , "Name is required"],
            trim : true,
            minlength : [2 , "Name must be at least 2 characters long"],
            maxlength : [50 , "Name must be at most 50 characters long"]
        },

        email : {
            type : String,
            required : [true , "Email is required"],
            unique : true,
            lowercase : true,
            trim : true
        },

        password : {
            type : String,
            required : [true , "Password is required"],
            minlength : [6 , "Password must be at least 6 characters long"],
            select : false
        },

        role : {
            type : String,
            enum : ["admin" , "employee"],
            default : "employee"
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ""
        },

        avatar: {
            type: String,
            default: ""
        },

        preferences: {
            theme: {
                type: String,
                enum: ["light", "dark", "system"],
                default: "system"
            },

            timezone: {
                type: String,
                default: "Asia/Kolkata"
            },

            notifications: {
                taskAssigned: {
                    type: Boolean,
                    default: true
                },

                taskStatusChanged: {
                    type: Boolean,
                    default: true
                },

                comments: {
                    type: Boolean,
                    default: true
                },

                projectInvites: {
                    type: Boolean,
                    default: true
                }
            }
        }
    },
    {
        timestamps : true
    }
);

const User = mongoose.model("User" , userSchema);

module.exports = User;