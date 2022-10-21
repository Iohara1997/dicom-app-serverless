import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import dicomService from '../../services'
// @ts-ignore
import parser from "lambda-multipart-parser";
// @ts-ignore
import dicomParser from 'dicom-parser'
import Dicom from "src/models/Dicom";

const DICOM_DICTIONARY = {
  patientId: 'x00100020',
  patientName: 'x00100010',
  studyUID: 'x0020000d',
  studyDescription: 'x00081030',
}

export const postDataDicom = middyfy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const result = await parser.parse(event, false);
    const arrayBuffer = result.files[0].content;
    const byteArray = new Uint8Array(arrayBuffer);
    // const options = { TransferSyntaxUID: '1.2.840.10008.1.2' };
    const dicomMetaData = dicomParser.parseDicom(byteArray);

    const studyInstanceUID = dicomMetaData.string(DICOM_DICTIONARY.studyUID);

    const dicomExists = await dicomService.getDicom(studyInstanceUID);

    const dicomFile = {
      StudyDescription: dicomMetaData.string(DICOM_DICTIONARY.studyDescription),
      StudyInstanceUID: dicomMetaData.string(DICOM_DICTIONARY.studyUID),
      PatientName: dicomMetaData.string(DICOM_DICTIONARY.patientName),
      PatientID: dicomMetaData.string(DICOM_DICTIONARY.patientId)
    } as Dicom;

    if (dicomExists) {
      if (dicomFile.PatientID === dicomExists.PatientID &&
        dicomFile.StudyDescription === dicomExists.StudyDescription &&
        dicomFile.PatientName === dicomExists.PatientName) {
        return formatJSONResponse({
          status: 403,
          message: "Study alredy exists"
        })
      }
      const dicomUpdated = await dicomService.updateDicom(studyInstanceUID, dicomFile);
      return formatJSONResponse({
        dicomUpdated
      });
    }

    const dicom = await dicomService.createDicom(dicomFile);

    return formatJSONResponse({
      dicom
    });
  } catch (e) {
    console.error(e);
    return formatJSONResponse({
      status: 500,
      message: e
    });
  }
})