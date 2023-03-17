import {
  addCat,
  deleteCat,
  getAllCats,
  getCat,
  updateCat,
  getCatsByUser,
} from '../models/catModel';
import {Request, Response, NextFunction} from 'express';
import {Cat, PostCat} from '../../interfaces/Cat';
import {User} from '../../interfaces/User';
import CustomError from '../../classes/CustomError';
import {validationResult} from 'express-validator';
import MessageResponse from '../../interfaces/MessageResponse';

const catListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await getAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  const id = parseInt(req.params.id);
  try {
    const cat = await getCat(id);
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catGetByUser = async () => {};
// TODO: create catPost function to add new cat
// catPost should use addCat function from catModel
// catPost should use validationResult to validate req.body
// catPost should use req.file to get filename
// catPost should use res.locals.coords to get lat and lng (see middlewares.ts)
// catPost should use req.user to get user_id
const catPost = async (
  req: Request<{}, {}, PostCat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req.body);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }
  try {
    req.body.lat = res.locals.coords[0];
    req.body.lng = res.locals.coords[1];
    const user = req.user as User;
    req.body.owner = user.user_id;
    req.body.filename = req.file!.filename || 'moro';
    const result = await addCat(req.body);
    if (result) {
      const message: MessageResponse = {
        message: 'cat added',
        id: result,
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Cat>,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages: string = errors
      .array()
      .map((error) => `${error.msg}: ${error.param}`)
      .join(', ');
    console.log('cat_post validation', messages);
    next(new CustomError(messages, 400));
    return;
  }

  try {
    const id = parseInt(req.params.id);
    const cat = req.body;
    console.log(cat);
    const result = await updateCat(
      cat,
      id,
      (req.user as User).user_id,
      (req.user as User).role
    );
    if (result) {
      const message: MessageResponse = {
        message: 'cat updated',
        id,
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

// TODO: create catDelete function to delete cat
// catDelete should use deleteCat function from catModel
// catDelete should use validationResult to validate req.params.id
const catDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => {
          `${error.msg}: ${error.param}`;
        })
        .join(', ');
      throw new CustomError(messages, 400);
    }

    const result = await deleteCat(parseInt(req.params.id));
    if (result) {
      const message: MessageResponse = {
        message: 'cat updated',
        id: parseInt(req.params.id),
      };
      res.json(message);
    }
  } catch (error) {
    next(error);
  }
};

export {catListGet, catGet, catGetByUser, catPost, catPut, catDelete};
