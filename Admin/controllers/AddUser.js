// Here we will writing the controllers for adding the teacher and student details
const TeacherDetailModel = require('../../models/teacher/TeacherDetailModel');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync')


// Admin to add a new student profile
exports.AddStudent = catchAsync(async(req, res) => {
  
  res.status(200).json({
    message: 'success'
  })

})

// Admin to add a new teacher profile
exports.AddTeacher = catchAsync(async(req, res) => {
    const {tid, name, age, gender, school, password, passwordConfirm, personalMail, phoneNumber, photo, profileSummary, workExperience, ResearchInterests} = req.body;
   
    // Try creating the teacher profile
    const newTeacher = await TeacherDetailModel.create({
        tid,
        name,
        age,
        gender,
        school,
        password,
        passwordConfirm,
        personalMail, phoneNumber, photo, profileSummary, workExperience, ResearchInterests
    });

     // Send the success response
     res.status(201).json({
        status: 'success',
        data: {
            teacher: newTeacher
        }
    });
});

