// routes/tutorPublicRoutes.js (or wherever appropriate)
import express from 'express';
import { getFullTutorInfo, searchTutors } from '../controllers/studentController.js';


const studentRouter = express.Router();

studentRouter.get('/tutors/search', searchTutors); 

studentRouter.get('/tutors/:tutorId', getFullTutorInfo);


export default studentRouter;
