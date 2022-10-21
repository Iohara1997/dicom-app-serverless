import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Dicom from "../models/Dicom";

export default class DicomService {

  private Tablename: string = "dicom";

  constructor(private docClient: DocumentClient) { }

  async getAllDicom(): Promise<Dicom[]> {
    const dicom = await this.docClient.scan({
      TableName: this.Tablename,
    }).promise()
    return dicom.Items as Dicom[];
  }

  async createDicom(dicom: Dicom): Promise<Dicom> {
    await this.docClient.put({
      TableName: this.Tablename,
      Item: dicom
    }).promise()
    return dicom as Dicom;

  }

  async getDicom(id: string): Promise<any> {
    const dicom = await this.docClient.get({
      TableName: this.Tablename,
      Key: {
        StudyInstanceUID: id
      }
    }).promise()
    return dicom.Item as Dicom;
  }

  async updateDicom(id: string, dicom: Partial<Dicom>): Promise<Dicom> {
    const updated = await this.docClient
      .update({
        TableName: this.Tablename,
        Key: { StudyInstanceUID: id },
        UpdateExpression:
          "set #PatientID = :PatientID, PatientName = :PatientName, StudyDescription = :StudyDescription",
        ExpressionAttributeNames: {
          "#PatientID": "PatientID",
        },
        ExpressionAttributeValues: {
          ":PatientID": dicom.PatientID,
          ":PatientName": dicom.PatientName,
          ":StudyDescription": dicom.StudyDescription,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();
    return updated.Attributes as Dicom;
  }

  async deleteDicom(id: string): Promise<any> {
    return await this.docClient.delete({
      TableName: this.Tablename,
      Key: {
        StudyInstanceUID: id
      }
    }).promise();
  }
}