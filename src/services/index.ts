import { dynamoDBClient } from "../models/index"
import DicomService from "./DicomService"

const dicomService = new DicomService(dynamoDBClient());
export default dicomService;