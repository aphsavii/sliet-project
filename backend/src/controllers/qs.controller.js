import { Qs } from "../models/qs.modal.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/uploadOnCloudinary.js";

const uploadQs = asyncHandler(async (req, res)=>{
    // check if user is authorized
    // check each required details about qs is present in req
    // upload file in cloudinary, return if failed
    // save in db, return and also delete file from cloudinary if failed;


    if(!req.user) return res.status(401).json(new ApiError('Unauthorized User',401, ['Inavalid Token']));

    const {subCode , subName, programme, trade, sem }= req.body;
    const user = req.user;

    if([subCode, subName, programme, trade, sem].some((field)=>{
        let temp = field ?? '';
        return temp == '';
    }))
    {
        return res.status(400).json(new ApiError('subCode, subName, programme, trade, sem are mandatory',400));
    }

    let qsUrl= '';
    if(req.files && req.files.qs && req.files.qs.length>0){
        let localFilePath= req.files.qs[0].path;
        const uploadUrl = await uploadOnCloudinary(localFilePath, '/qs');
        qsUrl = uploadUrl;
    } 

    if(!qsUrl) return  res.status(500).json(new ApiError('Failed to upload file', 500));

    const qs = await Qs.create({
        subCode,
        subName,
        programme,
        trade,
        sem,
        qsUrl,
        uploadedBy: user._id
    });

    if(!qs) {
        await deleteFromCloudinary(qsUrl);
        return new ApiError('Failed to save in db', 500);
    }
    return res.status(201).json(new ApiResponse(201,'Question paper uploaded successfully',qs));

});

const approveQs = asyncHandler(
    async (req,res)=>{
        if(!req.user) return res.status(401).json(new ApiError("Unauthorized Request",401,['Invalid Token']));
        const qsId = req.params.qsId;
        const user = req.user;
        if(user.role !== 'admin') return res.status(401).json(new ApiError("Unauthorized Request",401,['Admin access required']));

        const qs = await Qs.findById(qsId);
        if(!qs) return res.status(404).json(new ApiError("Question paper not found",404));

        qs.status = 'approved';
        const updatedQs = await qs.save({validateBeforeSave: false});

        if(!updatedQs) return res.status(500).json(new ApiError("Failed to update status",500));

        return res.status(200).json(new ApiResponse(200,"Question paper approved successfully",updatedQs));
    }
);

const getAllQs = asyncHandler(
    async (req,res)=>{
        const qs = await Qs.find({status: 'approved'}).populate('uploadedBy','fullName email');
        return res.status(200).json(new ApiResponse("All approved question papers",qs));
    }
);

const getAllPendingQs = asyncHandler(
    async (req,res)=>{
        const qs = await Qs.find({status: 'pending'}).populate('uploadedBy','fullName email');
        return res.status(200).json(new ApiResponse("All pending question papers",qs));
    }
);

export { uploadQs, approveQs, getAllQs, getAllPendingQs}