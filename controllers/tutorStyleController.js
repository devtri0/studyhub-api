import { TutorStyle } from '../models/tutorStyle.js';
import { tutorStyleUpdateValidator, tutorStyleValidator } from '../validators/tutorValidation.js';


export const createTutorStyle = async (req, res) => {
  const { error, value } = tutorStyleValidator.validate(req.body);
  if (error) return res.status(422).json({ 
    success: false, 
    errors: error.details 
  });

  if (await TutorStyle.findOne({ user: req.auth.id })) {
    return res.status(409).json({ success: false });
  }

  const newTutorStyle = await TutorStyle.create({ ...value, user: req.auth.id });
  res.status(201).json({ success: true, data: newTutorStyle });
};



export const getTutorStyle = async (req, res) => {
  const tutorStyle = await TutorStyle.findOne({ user: req.params.userId })
    .populate('user', 'firstName lastName');
  if (!tutorStyle) return res.status(404).json({ success: false });
  res.json({ success: true, data: tutorStyle });
};



export const updateTutorStyle = async (req, res) => {
  const { error, value } = tutorStyleUpdateValidator.validate(req.body);
  if (error) return res.status(422).json({ success: false, errors: error.details });

  const tutorStyle = await TutorStyle.findOne({ user: req.params.userId });
  if (!tutorStyle) return res.status(404).json({ success: false });
  if (tutorStyle.user.toString() !== req.auth.id) return res.status(403).json({ success: false });

  const updatedStyle = await TutorStyle.findOneAndUpdate(
    { user: req.params.userId },
    value,
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: updatedStyle });
};