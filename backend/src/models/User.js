import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        minlength:6,
    },
    // bio:{
    //     type:String,
    //     default:"",
    // },
    profilePic:{
        type:String,
        default:"",
    },
    // nativeLanguage:{
    //     type:String,
    //     default:"",
    // },
    // learningLanguage:{
    //     type:String,
    //     default:"",
    // },
    // isOnboarded:{      //this field decides if user can go to other page or not as he requires to onboard
    //     type:Boolean,
    //     default:false,
    // },
    // friends:[
    //     {
    //         type:mongoose.Schema.Types.ObjectId,  //not object if you are friend of john you have his id and put in friends arr
    //         ref:"User",
    //     }
    // ]
    
},{timestamps:true});

//pre hook(just before save user hash their password in db)
userSchema.pre("save",async function(next){  //this line telling to hash password before save in db
    if(!this.isModified("password")) return next(); //if user try update something else than password dont hash password just return from fun()
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        next();
    }catch(error) {
        next(error);
    }
});

userSchema.methods.matchPassword=async function (enteredPassword) {
    const isPasswordCorrect=await bcrypt.compare(enteredPassword,this.password); //compare entered password to password in db
    return isPasswordCorrect;
}

//hashing of password done before above , as model gets created
const User=mongoose.model("User",userSchema);



export default User;