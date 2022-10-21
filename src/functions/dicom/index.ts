import { handlerPath } from '@libs/handler-resolver';

export const postDataDicom = {
  handler: `${handlerPath(__dirname)}/handler.postDataDicom`,
  events: [
    {
      http: {
        method: 'post',
        path: 'dicom',
      },
    },
  ],
};
