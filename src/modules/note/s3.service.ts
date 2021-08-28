import { S3 } from 'aws-sdk';
import {
  AWS_S3_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
} from '../../constants';

const s3 = new S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

export async function deleteAwsImg(key: string) {
  await s3
    .deleteObject({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: key,
    })
    .promise();
}
