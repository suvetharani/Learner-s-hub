const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    rollNumber: {
      type: String,
      required: function () {
        return this.role === "student";
      }
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    },

    // Instructor specific fields
    degree: {
      type: String
    },

    specialization: {
      type: String
    },

    experience: {
      type: String
    },

    bio: {
      type: String
    },
    
    profileImage: {
      type: String
    },

    // aggregate study time for rankings
    studyTime: {
      totalSeconds: {
        type: Number,
        default: 0
      },
      daily: [
        {
          date: String, // YYYY-MM-DD
          seconds: {
            type: Number,
            default: 0
          }
        }
      ]
    },

    learning: {
      readTopicIds: {
        type: [String],
        default: []
      },
      completedCourseIds: {
        type: [String],
        default: []
      },
      totalPoints: {
        type: Number,
        default: 0
      },
      recentCourses: [
        {
          id: String,
          name: String,
          domain: String,
          progress: Number,
          points: Number,
          lastAccessed: Date
        }
      ]
    },
    notifications: {
      lastSeenAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);