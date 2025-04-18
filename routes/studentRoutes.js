// routes/tutorPublicRoutes.js (or wherever appropriate)
import express from 'express';
import { getAllTutors, getFullTutorInfo, searchTutors } from '../controllers/studentController.js';


const studentRouter = express.Router();

studentRouter.get("/tutors", getAllTutors);

studentRouter.get('/tutors/search', searchTutors); 

studentRouter.get('/tutors/:tutorId', getFullTutorInfo);


export default studentRouter;
