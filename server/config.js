import SES from 'aws-sdk/clients/ses.js';
import S3 from 'aws-sdk/clients/s3.js';
import dotenv from 'dotenv';
import node_geocoder from 'node-geocoder';
dotenv.config();
export const DATABASE_URI = process.env.DATABASE_URI;

export const AWS_ACCESS_KEY = process.env.AWS_ACCESS_ID;

export const AWS_SECRET_KEY = process.env.AWS_SECRET_ID;

export const EMAIL_FROM = 'ahujavaibhav825@gmail.com';
const awsConfig = {
	accessKeyId: AWS_ACCESS_KEY,
	secretAccessKey: AWS_SECRET_KEY,
	region: 'ap-south-1',
	apiVersion: '2010-12-01',
};

export const AWSSES = new SES(awsConfig);
export const AWSS3 = new S3(awsConfig);

const options = {
	provider: 'google',
	apiKey: process.env.apiKey,
	formatter: null,
};
export const GOOGLE_GEOCODER = node_geocoder(options);
export const JWT_SECRET_KEY = process.env.JWT_SECRET_ID;
export const CLIENT_URL = 'http://localhost:3000';
