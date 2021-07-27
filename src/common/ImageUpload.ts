import { v4 as uuid } from 'uuid';

export class ImageUpload {
  static customFileName(req, file: Express.Multer.File, cb) {
    let fileExtension = '';
    if (file.mimetype.indexOf('jpeg') > -1) {
      fileExtension = 'jpg';
    } else if (file.mimetype.indexOf('png') > -1) {
      fileExtension = 'png';
    }
    const originalName = file.originalname.split('.')[0];
    cb(null, originalName + '-' + uuid() + '.' + fileExtension);
  }

  static destinationPath(req, file: Express.Multer.File, cb) {
    cb(null, './images1');
  }
}
